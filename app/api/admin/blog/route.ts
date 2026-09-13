import { NextRequest, NextResponse } from "next/server";
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
    .from("blog_posts")
    .select("id,slug,title,excerpt,cover,published_at,visible,created_at")
    .order("published_at", { ascending: false });
  if (error?.message?.includes("blog_posts")) {
    // Таблица ещё не создана — возвращаем пустой массив
    return NextResponse.json({ posts: [], needsMigration: true });
  }
  return NextResponse.json({ posts: data ?? [] });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    items?: Array<{
      id?: string;
      slug: string;
      title: string;
      excerpt?: string;
      content?: string;
      cover?: string;
      published_at?: string;
      visible?: boolean;
    }>;
  } | null;
  if (!body?.items) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const db = service();
  for (const item of body.items) {
    const row = {
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt ?? "",
      content: item.content ?? "",
      cover: item.cover ?? null,
      published_at: item.published_at ?? new Date().toISOString(),
      visible: item.visible !== false,
    };

    if (item.id) {
      await db.from("blog_posts").update(row).eq("id", item.id);
    } else {
      const { data: existing } = await db.from("blog_posts").select("id").eq("slug", item.slug).maybeSingle();
      if (existing?.id) {
        await db.from("blog_posts").update(row).eq("id", existing.id);
      } else {
        await db.from("blog_posts").insert(row);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const db = service();
  await db.from("blog_posts").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
