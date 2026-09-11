import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  return NextResponse.json({
    siteConfig: data.siteConfig,
    heroContent: data.heroContent,
    programs: data.programs,
    gallery: data.gallery,
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
  } | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const db = service();
  const rows: { key: string; value: unknown }[] = [];
  if (body.settings) rows.push({ key: "settings", value: body.settings });
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

  // Для ключа settings храним плоские поля siteConfig по отдельным ключам
  if (body.settings) {
    for (const [k, v] of Object.entries(body.settings)) {
      const { error } = await db
        .from("site_settings")
        .upsert({ key: k, value: v, updated_at: new Date().toISOString() });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    await db.from("site_settings").delete().eq("key", "settings");
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
