import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getContent } from "@/lib/content";
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

  const { data, visibility } = await getContent();
  const db = service();

  // Все site_settings
  const { data: settingsRows } = await db.from("site_settings").select("key,value");
  const settings: Record<string, unknown> = {};
  for (const row of settingsRows ?? []) settings[row.key] = row.value;

  // Все фото
  const { data: photos } = await db
    .from("gallery_photos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  // Все программы
  const { data: programs } = await db
    .from("programs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  // Все отзывы
  const { data: reviews } = await db
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  // Все новости
  const { data: news } = await db
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  return NextResponse.json({
    version: "sfera-export-1.0",
    exportedAt: new Date().toISOString(),
    settings,
    visibility,
    hero: data.heroContent,
    learningExperience: data.learningExperience,
    teachers: data.teachers,
    faqs: data.faqs,
    photos: photos ?? [],
    programs: programs ?? [],
    reviews: reviews ?? [],
    news: news ?? [],
  });
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.version || typeof body.version !== "string" || !body.version.startsWith("sfera-export")) {
    return NextResponse.json({ error: "Неверный формат файла" }, { status: 400 });
  }

  // site_settings
  const settings = body.settings as Record<string, unknown> | undefined;
  if (settings && typeof settings === "object") {
    for (const [key, value] of Object.entries(settings)) {
      await db.from("site_settings").upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
    }
  }
  // visibility
  if (body.visibility && typeof body.visibility === "object") {
    await db.from("site_settings").upsert({
      key: "visibility",
      value: body.visibility,
      updated_at: new Date().toISOString(),
    });
  }
  // hero
  if (body.hero && typeof body.hero === "object") {
    await db.from("site_settings").upsert({
      key: "hero",
      value: body.hero,
      updated_at: new Date().toISOString(),
    });
  }
  // learningExperience
  if (body.learningExperience && typeof body.learningExperience === "object") {
    await db.from("site_settings").upsert({
      key: "learningExperience",
      value: body.learningExperience,
      updated_at: new Date().toISOString(),
    });
  }
  // teachers
  if (body.teachers && Array.isArray(body.teachers)) {
    await db.from("site_settings").upsert({
      key: "teachers",
      value: body.teachers,
      updated_at: new Date().toISOString(),
    });
  }
  // faqs
  if (body.faqs && Array.isArray(body.faqs)) {
    await db.from("site_settings").upsert({
      key: "faqs",
      value: body.faqs,
      updated_at: new Date().toISOString(),
    });
  }

  // gallery_photos: очистить и вставить заново
  const photos = body.photos as Record<string, unknown>[] | undefined;
  if (Array.isArray(photos)) {
    const { error: delErr } = await db.from("gallery_photos").delete().neq("id", 0);
    if (delErr) return NextResponse.json({ error: "очистка фото: " + delErr.message }, { status: 500 });
    if (photos.length > 0) {
      const { error } = await db.from("gallery_photos").insert(
        photos.map((p, i) => ({
          src: String(p.src),
          alt: String(p.alt ?? ""),
          span: String(p.span ?? "normal"),
          pos: p.pos ? String(p.pos) : null,
          sort_order: Number(p.sort_order ?? i + 1),
        }))
      );
      if (error) return NextResponse.json({ error: "импорт фото: " + error.message }, { status: 500 });
    }
  }

  // programs: обновить существующие, вставить новые
  const programs = body.programs as Record<string, unknown>[] | undefined;
  if (Array.isArray(programs)) {
    for (let i = 0; i < programs.length; i++) {
      const p = programs[i];
      const row = {
        title: String(p.title ?? ""),
        age: String(p.age ?? p.age_range ?? ""),
        short_desc: String(p.short_desc ?? p.description ?? ""),
        image: String(p.image ?? ""),
        image_alt: String(p.image_alt ?? ""),
        is_visible: p.is_visible !== false && p.visible !== false,
        sort_order: Number(p.sort_order ?? i + 1),
        updated_at: new Date().toISOString(),
      };
      if (p.id) {
        await db.from("programs").update(row).eq("id", p.id);
      } else {
        await db.from("programs").insert({ ...row, full_desc: row.short_desc });
      }
    }
  }

  // reviews: очистить и вставить заново.
  // Важно: колонки таблицы — author/source/source_url/child_info, а НЕ name/rating.
  // Прежний маппинг в несуществующие колонки падал с ошибкой, которую глушили,
  // НО удаление до этого уже выполнялось → импорт бэкапа стирал все отзывы.
  const reviews = body.reviews as Record<string, unknown>[] | undefined;
  if (Array.isArray(reviews)) {
    const { error: delErr } = await db.from("reviews").delete().neq("id", 0);
    if (delErr) return NextResponse.json({ error: "очистка отзывов: " + delErr.message }, { status: 500 });
    if (reviews.length > 0) {
      const { error } = await db.from("reviews").insert(
        reviews.map((r, i) => ({
          author: String(r.author ?? r.name ?? ""),
          source: String(r.source ?? ""),
          source_url: String(r.source_url ?? ""),
          text: String(r.text ?? ""),
          child_info: String(r.child_info ?? r.childInfo ?? ""),
          visible: r.visible !== false,
          sort_order: Number(r.sort_order ?? i + 1),
        }))
      );
      if (error) return NextResponse.json({ error: "импорт отзывов: " + error.message }, { status: 500 });
    }
  }

  // news: очистить и вставить заново
  const news = body.news as Record<string, unknown>[] | undefined;
  if (Array.isArray(news)) {
    const { error: delErr } = await db.from("news").delete().neq("id", 0);
    if (delErr) return NextResponse.json({ error: "очистка новостей: " + delErr.message }, { status: 500 });
    if (news.length > 0) {
      const { error } = await db.from("news").insert(
        news.map((n) => ({
          vk_post_id: n.vk_post_id ? String(n.vk_post_id) : null,
          title: String(n.title ?? ""),
          content: String(n.content ?? ""),
          excerpt: String(n.excerpt ?? ""),
          image_url: n.image_url ? String(n.image_url) : null,
          source_url: n.source_url ? String(n.source_url) : null,
          published_at: n.published_at ? String(n.published_at) : new Date().toISOString(),
          visible: n.visible !== false,
        }))
      );
      if (error) return NextResponse.json({ error: "импорт новостей: " + error.message }, { status: 500 });
    }
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, imported: true });
}
