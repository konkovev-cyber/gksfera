import { createClient } from "@supabase/supabase-js";

const service = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

/**
 * «Закреплённые» новости VK.
 *
 * Смысл: обычно пост из VK — источник истины, и синхронизация перезаписывает
 * строку целиком. Но иногда пост в группе потом правят (или, наоборот, текст устарел),
 * а на сайте нужна своя версия. Закрепление говорит синхронизации: эту строку не
 * трогать — ни текст, ни обложку, ни дату.
 *
 * Хранится одним JSON-массивом в site_settings (ключ news_pinned), а не колонкой в
 * news: колонка потребовала бы миграцию схемы, а её выполнить может только владелец
 * проекта. Список ключей — то же самое по функции и без риска для данных.
 * Если позже захотите колонку pinned — перенесём одной строкой SQL.
 */
const SETTING_KEY = "news_pinned";

/** Ключи закреплённых новостей (vk_post_id импортированных записей). */
export async function getPinnedNewsKeys(): Promise<string[]> {
  try {
    const db = service();
    const { data } = await db.from("site_settings").select("value").eq("key", SETTING_KEY).maybeSingle();
    const raw = data?.value;
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

/** Закрепить/открепить новость; возвращает актуальный список ключей. */
export async function setPinnedNewsKey(key: string, on: boolean): Promise<string[]> {
  const k = String(key ?? "").trim();
  if (!k) return getPinnedNewsKeys();
  const current = await getPinnedNewsKeys();
  const next = on ? Array.from(new Set([...current, k])) : current.filter((x) => x !== k);
  const db = service();
  const { error } = await db
    .from("site_settings")
    .upsert({ key: SETTING_KEY, value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  return next;
}
