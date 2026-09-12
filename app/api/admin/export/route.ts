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

  // gallery_photos: очистить и вставить заново
  const photos = body.photos as Record<string, unknown>[] | undefined;
  if (Array.isArray(photos)) {
    await db.from("gallery_photos").delete().neq("id", 0);
    if (photos.length > 0) {
      await db.from("gallery_photos").insert(
        photos.map((p, i) => ({
          src: String(p.src),
          alt: String(p.alt ?? ""),
          span: String(p.span ?? "normal"),
          pos: p.pos ? String(p.pos) : null,
          sort_order: Number(p.sort_order ?? i + 1),
        }))
      );
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

  // reviews: очистить и вставить заново
  const reviews = body.reviews as Record<string, unknown>[] | undefined;
  if (Array.isArray(reviews)) {
    await db.from("reviews").delete().neq("id", 0);
    if (reviews.length > 0) {
      await db.from("reviews").insert(
        reviews.map((r, i) => ({
          name: String(r.name ?? ""),
          text: String(r.text ?? ""),
          rating: Number(r.rating ?? 5),
          visible: r.visible !== false,
          sort_order: Number(r.sort_order ?? i + 1),
        }))
      );
    }
  }

  // news: очистить и вставить заново
  const news = body.news as Record<string, unknown>[] | undefined;
  if (Array.isArray(news)) {
    await db.from("news").delete().neq("id", 0);
    if (news.length > 0) {
      await db.from("news").insert(
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
    }
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");

  return NextResponse.json({ ok: true, imported: true });
}
