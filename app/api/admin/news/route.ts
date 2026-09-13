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

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const { data, error } = await db
    .from("news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ news: data ?? [] });
}

/**
 * POST /api/admin/news — импорт новостей из JSON.
 * Тело: { news: [{ vk_post_id?, title, content, excerpt?, image_url?,
 *                    source_url?, published_at?, visible? }] }
 * Опция ?append=1 — добавить к существующим, иначе заменяет все.
 */
export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const url = new URL(req.url);
  const append = url.searchParams.get("append") === "1";
  const body = (await req.json().catch(() => null)) as { news?: unknown[] } | null;
  const items = body?.news;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Ожидается { news: [ ... ] } с хотя бы одной записью" }, { status: 400 });
  }

  const normalized = items.map((raw) => {
    const n = (raw ?? {}) as Record<string, unknown>;
    return {
      vk_post_id: n.vk_post_id != null ? String(n.vk_post_id) : null,
      title: String(n.title ?? "").trim(),
      content: String(n.content ?? ""),
      excerpt: String(n.excerpt ?? ""),
      image_url: n.image_url != null ? String(n.image_url) : null,
      source_url: n.source_url != null ? String(n.source_url) : null,
      published_at: n.published_at ? String(n.published_at) : new Date().toISOString(),
      visible: n.visible !== false,
    };
  }).filter((n) => n.title);

  if (normalized.length === 0) {
    return NextResponse.json({ error: "Ни в одной записи нет непустого title" }, { status: 400 });
  }

  if (!append) {
    await db.from("news").delete().neq("id", 0);
  }
  const { data: inserted, error } = await db.from("news").insert(normalized).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/news");
  return NextResponse.json({ ok: true, count: inserted?.length ?? 0, news: inserted });
}

export async function PATCH(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    visible?: boolean;
  } | null;
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = service();
  const patch: Record<string, unknown> = {};
  if (body.visible !== undefined) patch.visible = body.visible;
  const { error } = await db.from("news").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = service();
  const { error } = await db.from("news").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
