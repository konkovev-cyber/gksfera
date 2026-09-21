import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { cleanVkDomain } from "@/lib/vk-sync";

const VK_VERSION = "5.199";

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const serviceKey = process.env.VK_SERVICE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "VK_SERVICE_KEY не задан" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as {
    domain?: string;
    count?: number;
  } | null;

  const rawDomain = body?.domain || process.env.VK_COMMUNITY_DOMAIN || "sferaznanei";
  let domain = cleanVkDomain(rawDomain);
  if (!domain || domain.toLowerCase() === "sfera_gk") {
    domain = "sferaznanei";
  }
  const count = Math.min(body?.count || 20, 100);

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
    return NextResponse.json({ error: `Ошибка запроса к VK: ${(e as Error).message}` }, { status: 500 });
  }

  if (vkData.error) {
    const err = vkData.error as Record<string, unknown>;
    return NextResponse.json({ error: `VK API: ${err.error_msg} (${err.error_code})` }, { status: 400 });
  }

  const response = vkData.response as Record<string, unknown> | undefined;
  const items = (response?.items ?? []) as Array<Record<string, unknown>>;

  // Извлекаем посты с текстом (пропускаем пустые и закреплённые)
  const posts = items
    .filter((post) => !post.is_pinned && post.text && String(post.text).trim().length > 20)
    .map((post) => {
      const text = String(post.text ?? "").trim();
      const sourceUrl = `https://vk.com/wall${post.owner_id}_${post.id}`;

      // Извлекаем обложку
      let cover: string | null = null;
      const attachments = post.attachments as Array<Record<string, unknown>> | undefined;
      if (attachments) {
        for (const att of attachments) {
          if (att.type === "photo" && att.photo) {
            const photo = att.photo as Record<string, unknown>;
            const sizes = (photo.sizes ?? []) as Array<Record<string, unknown>>;
            const preferred = ["w", "z", "y", "x"];
            for (const p of preferred) {
              const found = sizes.find((s) => s.type === p);
              if (found?.url) { cover = String(found.url).replace(/^http:\/\//i, "https://"); break; }
            }
            if (!cover && sizes.length > 0) {
              cover = String(sizes[sizes.length - 1].url).replace(/^http:\/\//i, "https://");
            }
            break;
          }
        }
      }

      const date = post.date
        ? new Date((post.date as number) * 1000).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
        : "";

      return {
        id: String(post.id),
        text: text.slice(0, 500),
        fullText: text,
        sourceUrl,
        cover,
        date,
      };
    });

  return NextResponse.json({ ok: true, posts });
}
