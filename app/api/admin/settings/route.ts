import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
import { getContent } from "@/lib/content";
import { serviceClient } from "@/lib/supabase-server";

const service = serviceClient;

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;
  const { data, visibility } = await getContent();
  return NextResponse.json({
    siteConfig: data.siteConfig,
    heroContent: data.heroContent,
    learningExperience: data.learningExperience,
    teachers: data.teachers,
    faqs: data.faqs,
    schedule: data.schedule,
    heroBanners: data.heroBanners,
    sectionsOrder: data.sectionsOrder,
    programs: data.programs,
    gallery: data.gallery,
    parentPains: data.parentPains,
    resultsAfterLearning: data.resultsAfterLearning,
    trustStats: data.trustStats,
    programOutcomes: data.programOutcomes,
    studioMotto: data.studioMotto,
    visibility,
  });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as {
    settings?: Record<string, unknown>;
    hero?: Record<string, unknown>;
    visibility?: Record<string, boolean>;
    learningExperience?: Record<string, unknown>;
    teachers?: unknown[];
    faqs?: unknown[];
    schedule?: unknown[];
    heroBanners?: unknown[];
    sectionsOrder?: string[];
    parentPains?: unknown[];
    resultsAfterLearning?: unknown[];
    trustStats?: unknown[];
    programOutcomes?: Record<string, unknown>;
    studioMotto?: string;
  } | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const db = service();
  const rows: { key: string; value: unknown }[] = [];
  if (body.hero) rows.push({ key: "hero", value: body.hero });
  if (body.visibility) rows.push({ key: "visibility", value: body.visibility });

  for (const row of rows) {
    const { error } = await db
      .from("site_settings")
      .upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // settings: пишем только плоские ключи siteConfig — без промежуточного upsert объекта
  // 'settings', который нет в switch-цепочке content.ts и поэтому при
  // следующем чтении просто игнорируется.
  if (body.settings) {
    for (const [k, v] of Object.entries(body.settings)) {
      const { error } = await db
        .from("site_settings")
        .upsert({ key: k, value: v, updated_at: new Date().toISOString() });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  if (body.learningExperience && typeof body.learningExperience === "object") {
    const { error } = await db.from("site_settings").upsert({
      key: "learningExperience",
      value: body.learningExperience,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.teachers && Array.isArray(body.teachers)) {
    const { error } = await db.from("site_settings").upsert({
      key: "teachers",
      value: body.teachers,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.faqs && Array.isArray(body.faqs)) {
    const { error } = await db.from("site_settings").upsert({
      key: "faqs",
      value: body.faqs,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.schedule && Array.isArray(body.schedule)) {
    const { error } = await db.from("site_settings").upsert({
      key: "schedule",
      value: body.schedule,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Массивные настройки в стиле «значение = JSON-массив»: общий цикл записи.
  for (const [k, v] of [
    ["heroBanners", body.heroBanners],
    ["sections", body.sectionsOrder], // назовём ключ «sections» — коротко и по смыслу
  ] as [string, unknown[] | undefined][]) {
    if (Array.isArray(v)) {
      const { error } = await db.from("site_settings").upsert({
        key: k,
        value: v,
        updated_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: `${k}: ` + error.message }, { status: 500 });
    }
  }

  if (body.parentPains && Array.isArray(body.parentPains)) {
    const { error } = await db.from("site_settings").upsert({
      key: "parentPains",
      value: body.parentPains,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.resultsAfterLearning && Array.isArray(body.resultsAfterLearning)) {
    const { error } = await db.from("site_settings").upsert({
      key: "resultsAfterLearning",
      value: body.resultsAfterLearning,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.trustStats && Array.isArray(body.trustStats)) {
    const { error } = await db.from("site_settings").upsert({
      key: "trustStats",
      value: body.trustStats,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.programOutcomes && typeof body.programOutcomes === "object") {
    const { error } = await db.from("site_settings").upsert({
      key: "programOutcomes",
      value: body.programOutcomes,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.studioMotto && typeof body.studioMotto === "string") {
    const { error } = await db.from("site_settings").upsert({
      key: "studioMotto",
      value: body.studioMotto,
      updated_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Область "layout": без неё валидным оставался бы только сам "/", а
  // статические /programs/[id], /news, /reviews доживали до ближайшей
  // пересборки — отсюда «в админке поменял, на сайте нет».
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
