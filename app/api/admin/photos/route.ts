import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { safePhotoKey } from "@/lib/photo-key";
import { checkAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const service = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

const BUCKET = "media";

function pathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const { data, error } = await db
    .from("gallery_photos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ photos: data ?? [] });
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();

  // Две схемы:
  // 1) application/json — файл уже загружен в Supabase Storage через
  //    /api/admin/photos/sign (signed URL, минуя тело серверной функции).
  //    В body приходит { src, alt, span, pos }.
  // 2) multipart/form-data — старая схема (небольшое изображение напрямую).
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const src = String(body.src ?? "").trim();
    const alt = String(body.alt ?? "").trim();
    const span = String(body.span ?? "normal").trim() || "normal";
    const pos = String(body.pos ?? "").trim() || null;
    if (!src) return NextResponse.json({ error: "src обязателен" }, { status: 400 });
    if (!/^https?:\/\//i.test(src) && !src.startsWith("/images/")) {
      return NextResponse.json({ error: "некорректный src" }, { status: 400 });
    }
    const { data: maxRow } = await db
      .from("gallery_photos")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const nextSort = ((maxRow?.[0]?.sort_order as number) ?? 0) + 1;
    const { data: inserted, error } = await db
      .from("gallery_photos")
      .insert({ src, alt, span, pos, sort_order: nextSort })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath("/", "layout");
    return NextResponse.json({ photo: inserted });
  }

  // multipart (обратная совместимость)
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  const alt = String(form.get("alt") ?? "");
  const span = String(form.get("span") ?? "normal");
  const pos = String(form.get("pos") ?? "").trim() || null;

  // Тот же ключ, что и у signed-пути: ASCII с транслитерацией, иначе русское
  // имя схлопывается в «_.jpg», а кириллица в ключе хранилище отвергается.
  const path = `gallery/${Date.now()}-${safePhotoKey(file.name)}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await db.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: false });
  if (up.error) {
    return NextResponse.json(
      { error: `Ошибка загрузки: ${up.error.message}` },
      { status: 500 }
    );
  }
  const { data } = db.storage.from(BUCKET).getPublicUrl(path);

  const { data: maxRow } = await db
    .from("gallery_photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSort = ((maxRow?.[0]?.sort_order as number) ?? 0) + 1;

  const { data: inserted, error } = await db
    .from("gallery_photos")
    .insert({ src: data.publicUrl, alt, span, pos, sort_order: nextSort })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/", "layout");
  return NextResponse.json({ photo: inserted });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const body = (await req.json().catch(() => null)) as {
    items?: { id: number | string; alt?: string; span?: string; pos?: string | null; sort_order?: number }[];
  } | null;
  if (!body?.items) return NextResponse.json({ error: "bad body" }, { status: 400 });

  for (const it of body.items) {
    const patch: Record<string, unknown> = {};
    if (it.alt !== undefined) patch.alt = it.alt;
    if (it.span !== undefined) patch.span = it.span;
    if (it.pos !== undefined) patch.pos = it.pos;
    if (it.sort_order !== undefined) patch.sort_order = it.sort_order;
    if (Object.keys(patch).length === 0) continue;
    const { error } = await db
      .from("gallery_photos")
      .update(patch)
      .eq("id", it.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id обязателен" }, { status: 400 });

  const { data: row } = await db
    .from("gallery_photos")
    .select("src")
    .eq("id", id)
    .single();
  if (row?.src) {
    const p = pathFromUrl(row.src);
    if (p) await db.storage.from(BUCKET).remove([p]);
  }
  const { error } = await db.from("gallery_photos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
