import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { slugifyRu } from "@/lib/news";
import { revalidateNews } from "@/lib/news-cache";
import { setPinnedNewsKey } from "@/lib/news-lock";
import { serviceClient } from "@/lib/supabase-server";

const service = serviceClient;

/**
 * Сколько новостей тянет админский список. 100 было маловато: при 150 записей
 * последние 50 в админке просто не появлялись — их нельзя было ни отредактировать,
 * ни удалить. Взяли 500 с запасом (это ~70 лет при 7 постах в месяц), на витрине
 * лимиты другие: 12 на главной и 100 в архиве /news — там лишнее только мешает.
 */
const ADMIN_LIST_LIMIT = 500;

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;
  const db = service();
  const { data, error } = await db
    .from("news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(ADMIN_LIST_LIMIT);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ news: data ?? [], limit: ADMIN_LIST_LIMIT });
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
    // PK — uuid, поэтому .neq("id", 0) давал ошибку 42883 (uuid<>integer) и
    // «замена» молча превращалась в «добавить дубли». Фильтр по not-null id
    // типобезопасен и покрывает все строки; ошибку больше не глотаем.
    const { error: delErr } = await db.from("news").delete().not("id", "is", null);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
  }
  const { data: inserted, error } = await db.from("news").insert(normalized).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateNews();
  return NextResponse.json({ ok: true, count: inserted?.length ?? 0, news: inserted });
}

/** Ключ URL: slug своей новости либо числовой id поста VK.
 *  Числа зарезервированы за VK (по ним уже проиндексированы /news/130…),
 *  поэтому вручную числовой ключ создать нельзя. */
const KEY_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

function safeUrl(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (/^(https?:\/\/|\/)/i.test(s) && !/["'\s]/.test(s)) return s;
  return null; // javascript:, data:, что угодно с кавычками — не сохраняем
}

/**
 * PUT /api/admin/news — создать или изменить ОДНУ новость (редактор в админке).
 * Тело: { id?: number|string, vk_post_id?: string, title, content?, excerpt?,
 *         image_url?, source_url?, published_at?, visible? }
 * Без id — создание; ключ (slug) генерируется из заголовка, если не задан.
 */
export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "не удалось прочитать тело запроса" }, { status: 400 });

  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!title) return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });

  const db = service();
  const id = body.id != null && body.id !== "" ? String(body.id) : null;

  let key = String(body.vk_post_id ?? "").trim().toLowerCase();
  if (!key) {
    key = slugifyRu(title);
  }
  if (!KEY_RE.test(key)) {
    return NextResponse.json(
      { error: "Адрес может содержать только латинские буквы, цифры и дефис, и не может состоять из одних цифр" },
      { status: 400 },
    );
  }
  // Числовой ключ — это id поста VK. Сам такой адрес не выдумывают (иначе
  // синхронизация потом перетрёт строку), но править уже импортированную
  // новость VK по её числовому адресу можно — иначе редактор для них не работал бы.
  const numericKey = /^\d+$/.test(key);
  if (numericKey && !id) {
    return NextResponse.json(
      { error: "Числовой адрес зарезервирован за новостями VK — добавьте к названию слово (например, «" + key + "-2»)" },
      { status: 400 },
    );
  }

  const row = {
    vk_post_id: key,
    title,
    content: String(body.content ?? "").slice(0, 100000),
    excerpt: String(body.excerpt ?? "").slice(0, 600),
    image_url: safeUrl(body.image_url),
    source_url: safeUrl(body.source_url),
    published_at: (() => {
      const d = new Date(String(body.published_at ?? ""));
      return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })(),
    visible: body.visible !== false,
  };

  // Занятость ключа — с учётом того, что правим свою же строку.
  const clash = await db
    .from("news")
    .select("id")
    .eq("vk_post_id", key)
    .limit(2);
  const taken = (clash.data ?? []).filter((r: { id: string | number }) => String(r.id) !== id);
  if (taken.length > 0) {
    return NextResponse.json({ error: `Адрес «${key}» уже занят другой новостью` }, { status: 409 });
  }

  if (numericKey && id) {
    const { data: mine } = await db.from("news").select("vk_post_id").eq("id", id).maybeSingle();
    if (!mine) return NextResponse.json({ error: "Новость с таким id не найдена" }, { status: 404 });
    if (String(mine.vk_post_id) !== key) {
      return NextResponse.json(
        { error: "Числовой адрес можно оставить только у новости, импортированной из VK" },
        { status: 400 },
      );
    }
  }

  // Закрепление — служебный список, живёт в site_settings (см. lib/news-lock.ts).
  let pinnedResult: { pinned: boolean; pinnedKeys: string[] } | null = null;
  if (typeof body.pinned === "boolean") {
    try {
      const keys = await setPinnedNewsKey(key, body.pinned);
      pinnedResult = { pinned: body.pinned, pinnedKeys: keys };
    } catch (e: unknown) {
      return NextResponse.json({ error: `не удалось сохранить закрепление: ${(e as Error).message}` }, { status: 500 });
    }
  }

  if (id) {
    const { data: updated, error } = await db.from("news").update(row).eq("id", id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!updated?.length) return NextResponse.json({ error: "Новость с таким id не найдена" }, { status: 404 });
    revalidateNews(key);
    return NextResponse.json({ ok: true, news: updated[0], created: false, ...(pinnedResult ?? {}) });
  }

  const { data: inserted, error } = await db.from("news").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateNews(key);
  return NextResponse.json({ ok: true, news: inserted, created: true, ...(pinnedResult ?? {}) });
}

/** Сброс кэша вынесен в lib/news-cache.ts — им пользуются ещё маршруты синхронизации. */

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
  revalidateNews();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = service();
  // Ключ нужен, чтобы сбросить кэш именно удалённой страницы, — читаем до удаления.
  const { data: victim } = await db.from("news").select("vk_post_id").eq("id", id).maybeSingle();
  const { error } = await db.from("news").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateNews(victim?.vk_post_id ? String(victim.vk_post_id) : undefined);
  return NextResponse.json({ ok: true });
}
