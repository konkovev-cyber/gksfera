import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const service = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

/** Декодирует HTML-entities VK */
function decodeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, c) => String.fromCharCode(parseInt(c, 16)));
}

/** Убирает HTML-теги, оставляя переносы строк */
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/** Извлекает URL обложки из attachments VK */
function extractCover(post: Record<string, unknown>): string | null {
  const attachments = post.attachments as Array<Record<string, unknown>> | undefined;
  if (!attachments) return null;

  for (const att of attachments) {
    if (att.type === "photo" && att.photo) {
      const photo = att.photo as Record<string, unknown>;
      const sizes = (photo.sizes ?? []) as Array<Record<string, unknown>>;
      // Приоритет: w > z > y > x > последний
      const preferred = ["w", "z", "y", "x"];
      for (const p of preferred) {
        const found = sizes.find((s) => s.type === p);
        if (found?.url) return String(found.url).replace(/^http:\/\//i, "https://");
      }
      if (sizes.length > 0) {
        const last = sizes[sizes.length - 1];
        if (last?.url) return String(last.url).replace(/^http:\/\//i, "https://");
      }
    }
    if (att.type === "video" && att.video) {
      const video = att.video as Record<string, unknown>;
      const images = (video.image ?? []) as Array<Record<string, unknown>>;
      const big = images.find((i) => (i.width as number) >= 800);
      if (big?.url) return String(big.url).replace(/^http:\/\//i, "https://");
      if (images.length > 0) return String(images[images.length - 1].url).replace(/^http:\/\//i, "https://");
    }
  }
  return null;
}

const VK_VERSION = "5.199";

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const serviceKey = process.env.VK_SERVICE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "VK_SERVICE_KEY не задан" },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    domain?: string;
    count?: number;
  } | null;
  const domain = body?.domain || process.env.VK_COMMUNITY_DOMAIN || "sfera_gk";
  const count = Math.min(body?.count || 10, 100);

  // 1. Вызываем VK API wall.get
  const params = new URLSearchParams({
    domain,
    count: String(count),
    extended: "1",
    v: VK_VERSION,
    access_token: serviceKey,
  });
  const apiUrl = `https://api.vk.com/method/wall.get?${params}`;

  let vkData: Record<string, unknown>;
  try {
    const res = await fetch(apiUrl);
    vkData = (await res.json()) as Record<string, unknown>;
  } catch (e: unknown) {
    return NextResponse.json(
      { error: `Ошибка запроса к VK: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  if (vkData.error) {
    const err = vkData.error as Record<string, unknown>;
    return NextResponse.json(
      { error: `VK API: ${err.error_msg} (${err.error_code})` },
      { status: 400 }
    );
  }

  const response = vkData.response as Record<string, unknown> | undefined;
  const items = (response?.items ?? []) as Array<Record<string, unknown>>;

  if (items.length === 0) {
    return NextResponse.json({ ok: true, imported: 0 });
  }

  // 2. Парсим посты (логика из vk-batch-fetch)
  const parsed = items
    .filter((post) => !post.is_pinned) // Пропускаем закреплённые
    .map((post) => {
      const text = stripHtml(decodeHtml(String(post.text ?? "")));
      const sourceUrl = `https://vk.com/wall${post.owner_id}_${post.id}`;

      let title = "Новость Сферы";
      if (text) {
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length > 0) title = lines[0].slice(0, 120).trim();
      }

      const cover = extractCover(post);
      const date = post.date
        ? new Date((post.date as number) * 1000).toISOString()
        : new Date().toISOString();

      return {
        vk_post_id: String(post.id),
        title,
        content: text,
        excerpt: text.slice(0, 200) + (text.length > 200 ? "…" : ""),
        image_url: cover,
        source_url: sourceUrl,
        published_at: date,
      };
    });

  // 3. Upsert в таблицу news (дедупликация по vk_post_id)
  const db = service();
  let imported = 0;

  for (const p of parsed) {
    const { data: existing } = await db
      .from("news")
      .select("id")
      .eq("vk_post_id", p.vk_post_id)
      .maybeSingle();

    if (existing?.id) {
      await db.from("news").update(p).eq("id", existing.id);
    } else {
      await db.from("news").insert({ ...p, visible: true });
      imported++;
    }
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true, imported, total: parsed.length });
}
