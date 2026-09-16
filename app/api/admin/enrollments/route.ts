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
    .from("enrollments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enrollments: data ?? [] });
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id обязателен" }, { status: 400 });
  const db = service();
  const { error } = await db.from("enrollments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Ручная запись заявки: переписка остаётся в MAX, а в журнал она попадает здесь. */
const SOURCES = ["site", "max", "phone", "vk"] as const;
const STATUSES = ["new", "contacted", "enrolled"] as const;

const tagOf: Record<string, string> = { max: "[MAX]", phone: "[ЗВОНОК]", vk: "[ВК]", site: "" };

const clip = (v: unknown, max: number): string =>
  String(v ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const parentName = clip(body.parent_name, 120);
  const contact = clip(body.phone, 80);
  // Имя или контакт — иначе в журнале появляется строка, по которой невозможно
  // понять, о ком речь, и она только засоряет счётчики.
  if (!parentName && !contact) {
    return NextResponse.json({ error: "укажите имя или контакт" }, { status: 400 });
  }

  const source = SOURCES.includes(clip(body.source, 12) as typeof SOURCES[number])
    ? clip(body.source, 12)
    : "max";
  const status = STATUSES.includes(clip(body.status, 20) as typeof STATUSES[number])
    ? clip(body.status, 20)
    : "new";

  const row = {
    parent_name: parentName || "без имени",
    child_age: clip(body.child_age, 40) || "—",
    interest: clip(body.interest, 80) || "other",
    interest_label: clip(body.interest_label, 120) || clip(body.interest, 80) || "Другое",
    phone: contact || "—",
    comment: clip(body.comment, 2000),
    status,
  };

  const db = service();
  const { data, error } = await db.from("enrollments").insert({ ...row, source }).select();
  if (!error) {
    return NextResponse.json({ ok: true, enrollment: data?.[0] ?? null });
  }

  // Колонки source может ещё не быть: миграция в репозитории, но на живую базу
  // её не применяли. Не выдумываем успех и не роняем ввод — пишем без поля, а
  // метку канала кладём в комментарий, откуда её честно читает интерфейс.
  // PostgREST отвечает двояко: «Could not find the 'source' column of
  // 'enrollments' в кэше схемы» или стандартным «column "source" ... does not
  // exist». Ловим именно отсутствие колонки, а не любую ошибку со словом source.
  if (/42703|could not find the ['"]?source['"]? column|column ['"]?source['"]? .*does not exist/i.test(error.message)) {
    const commented = { ...row, comment: [tagOf[source], row.comment].filter(Boolean).join(" ").trim() };
    const retry = await db.from("enrollments").insert(commented).select();
    if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 });
    return NextResponse.json({
      ok: true,
      enrollment: retry.data?.[0] ?? null,
      degraded: true,
      hint: "канал лёг меткой в комментарий — чтобы сделать его отдельным полем, выполните миграцию 20260916040000_add_source_to_enrollments.sql",
    });
  }

  return NextResponse.json({ error: error.message }, { status: 500 });
}

export async function PATCH(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    status?: string;
  } | null;
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: "id и status обязательны" }, { status: 400 });
  }
  const db = service();
  const { error } = await db
    .from("enrollments")
    .update({ status: body.status })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
