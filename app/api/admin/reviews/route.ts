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
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    const { reviews } = await import("@/data/site");
    const seed = reviews.map((r, i) => ({
      author: r.author,
      source: r.source,
      source_url: r.sourceUrl ?? "",
      text: r.text,
      child_info: r.childInfo ?? "",
      visible: true,
      sort_order: i + 1,
    }));
    const { data: seeded, error: seedErr } = await db
      .from("reviews")
      .insert(seed)
      .select()
      .order("sort_order", { ascending: true });
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 });
    revalidatePath("/");
    return NextResponse.json({ reviews: seeded ?? [] });
  }

  return NextResponse.json({ reviews: data });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const body = (await req.json().catch(() => null)) as {
    items?: {
      author: string;
      source?: string;
      sourceUrl?: string;
      text: string;
      childInfo?: string;
      visible?: boolean;
      sortOrder?: number;
    }[];
  } | null;
  if (!body?.items) return NextResponse.json({ error: "bad body" }, { status: 400 });

  await db.from("reviews").delete().neq("id", 0);
  if (body.items.length > 0) {
    const rows = body.items.map((r, i) => ({
      author: r.author,
      source: r.source ?? "",
      source_url: r.sourceUrl ?? "",
      text: r.text,
      child_info: r.childInfo ?? "",
      visible: r.visible ?? true,
      sort_order: r.sortOrder ?? i + 1,
    }));
    const { error } = await db.from("reviews").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
