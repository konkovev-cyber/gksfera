/**
 * Ключ и адрес новости.
 *
 * Исторически строка news опознана колонкой vk_post_id, и страница
 * /news/[id] ищет по ней. Менять схему миграцией нельзя (нет SQL-доступа),
 * поэтому vk_post_id используется как УНИВЕРСАЛЬНЫЙ ключ URL:
 *   • новости, импортированные из VK — числовой id поста (130, 129, …);
 *   • новости, написанные на сайте —slug из заголовка («den-otkrytyh-dverей»).
 * Числовой ключ и slug никогда не пересекаются: slugify гарантирует, что ключ
 * сайта не состоит только из цифр. Отсюда же «откуда новость» определяется без
 * дополнительного столбца — isVkNews().
 */

export type NewsKeyed = { vk_post_id?: string | null };

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** «День открытых дверей!» → «den-otkrytyh-dverey». Кириллица транслитерируется:
 *  такие ссылки читаются в мессенджерах и не превращаются в %D0%94… в поиске. */
export function slugifyRu(input: string): string {
  const lowered = String(input ?? "").toLowerCase().trim();
  let out = "";
  for (const ch of lowered) {
    if (/[a-z0-9]/.test(ch)) out += ch;
    else if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
    else if (/[\s\-_./]/.test(ch)) out += "-";
  }
  out = out.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 72).replace(/-$/, "");
  if (!out) return "novost";
  // Ключ из одних цифр означал бы новость VK — добавляем буквенный хвост.
  if (/^\d+$/.test(out)) out = `n-${out}`;
  return out;
}

/** Первый свободный вариант ключа: base, base-2, base-3 … */
export function uniqueSlug(base: string, taken: string[]): string {
  const used = new Set(taken.map(String));
  const clean = base || "novost";
  if (!used.has(clean)) return clean;
  for (let i = 2; i < 200; i++) {
    const candidate = `${clean}-${i}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${clean}-${Date.now().toString(36)}`;
}

/** Новость пришла из VK, если её ключ — число (id поста). */
export function isVkNews(item: NewsKeyed | null | undefined): boolean {
  return /^\d+$/.test(String(item?.vk_post_id ?? "").trim());
}

/** Ключ для URL и React-ключа; пустой — если у строки нет ключа (для такой
 *  новости страница не ссылается, а остаётся /news). */
export function newsKey(item: NewsKeyed | null | undefined): string {
  return String(item?.vk_post_id ?? "").trim();
}

export function newsUrl(item: NewsKeyed | null | undefined): string {
  const key = newsKey(item);
  return key ? `/news/${encodeURIComponent(key)}` : "/news";
}
