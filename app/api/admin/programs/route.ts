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

type ProgItem = {
  id?: number | string;
  title: string;
  ageRange?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  category?: "educational" | "creative";
  pos?: string;
  visible?: boolean;
  sortOrder?: number;
};

const normalize = (p: Record<string, unknown>) => {
  const features = (p.features ?? {}) as Record<string, unknown>;
  const cat = (p.category as string) ?? (features.category as string) ?? p.badge;
  return {
    id: p.id,
    title: p.title ?? "",
    age_range: p.age ?? p.age_range ?? "",
    description: p.short_desc ?? p.description ?? "",
    image: p.image ?? "",
    image_alt: p.image_alt ?? "",
    category: cat === "creative" ? "creative" : "educational",
    // Точка фокуса — колонка pos или в features.pos (JSONB)
    pos: p.pos ?? features.pos ?? "",
    // Иконка для карточки тоже хранится в features
    icon: features.icon ?? "",
    visible: p.is_visible !== false && p.visible !== false,
    sort_order: p.sort_order ?? 0,
  };
};

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const { data, error } = await db
    .from("programs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    const { programs } = await import("@/data/site");
    const seed = programs.map((p, i) => ({
      title: p.title,
      short_desc: p.description,
      full_desc: p.description,
      age: p.ageRange,
      image: p.image,
      image_alt: p.imageAlt,
      badge: p.category ?? "educational",
      features: { icon: p.icon, category: p.category ?? "educational" },
      is_visible: true,
      sort_order: i + 1,
    }));
    const { data: seeded, error: seedErr } = await db.from("programs").insert(seed).select();
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 });
    revalidatePath("/");
    return NextResponse.json({ programs: (seeded ?? []).map(normalize) });
  }

  return NextResponse.json({ programs: data.map(normalize) });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const body = (await req.json().catch(() => null)) as { items?: ProgItem[] } | null;
  if (!body?.items) return NextResponse.json({ error: "bad body" }, { status: 400 });

  for (let i = 0; i < body.items.length; i++) {
    const it = body.items[i];
    // features JSONB: читаем существующие (чтобы не затереть icon), обновляем pos
    let features: Record<string, unknown> = {};
    if (it.id) {
      const cur = await db.from("programs").select("features").eq("id", it.id).single();
      features = ((cur.data?.features ?? {}) as Record<string, unknown>);
    }
    features.category = it.category ?? "educational";
    if (it.pos) features.pos = it.pos; else delete features.pos;
    const baseRow: Record<string, unknown> = {
      title: it.title,
      age: it.ageRange ?? "",
      short_desc: it.description ?? "",
      image: it.image ?? "",
      image_alt: it.imageAlt ?? "",
      badge: it.category ?? "educational",  // хранится в существующей колонке badge
      features,
      is_visible: it.visible ?? true,
      sort_order: it.sortOrder ?? i + 1,
      updated_at: new Date().toISOString(),
    };
    const res = it.id
      ? await db.from("programs").update(baseRow).eq("id", it.id)
      : await db.from("programs").insert({ ...baseRow, full_desc: it.description ?? "" });
    if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
