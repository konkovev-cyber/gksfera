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

export type NewsVideo = {
  title: string;
  url: string;
  image?: string;
  duration?: number;
};

export type NewsMedia = {
  photos?: string[];
  videos?: NewsVideo[];
};

/** Очищает упоминания VK вида [club221386348|Сфера] или [id123|Иван] -> Сфера / Иван */
export function cleanVkMentions(text: string): string {
  if (!text) return "";
  return text.replace(/\[(?:(?:id|club)\d+|[a-zA-Z0-9_\.-]+)\|([^\]]+)\]/g, "$1");
}

const VK_MEDIA_TAG_RE = /<!--\s*vk_media:\s*(\{[\s\S]*?\})\s*-->/;

/**
 * Извлекает структурированные метаданные медиа из текста content (<!-- vk_media:{...} -->).
 * Возвращает чистый текст без служебного комментария и объект медиа.
 */
export function extractVkMediaMeta(rawContent?: string | null): {
  cleanContent: string;
  media: NewsMedia | null;
} {
  const text = String(rawContent ?? "");
  const match = text.match(VK_MEDIA_TAG_RE);
  if (!match) {
    return { cleanContent: text.trim(), media: null };
  }

  let media: NewsMedia | null = null;
  try {
    media = JSON.parse(match[1]) as NewsMedia;
  } catch {
    media = null;
  }

  const cleanContent = text.replace(VK_MEDIA_TAG_RE, "").trim();
  return { cleanContent, media };
}

/**
 * Собирает все медиа новости:
 * - Все уникальные фото (обложка image_url + дополнительные фото из альбома поста)
 * - Видеозаписи VK
 * - Список хэштегов из текста
 * - Очищенный от служебных меток текст
 */
export function parseNewsMedia(item: {
  content?: string | null;
  excerpt?: string | null;
  image_url?: string | null;
}): {
  text: string;
  photos: string[];
  videos: NewsVideo[];
  tags: string[];
} {
  const raw = item.content || item.excerpt || "";
  const { cleanContent, media } = extractVkMediaMeta(raw);

  const photos: string[] = [];
  if (item.image_url) {
    photos.push(item.image_url);
  }
  if (media?.photos && Array.isArray(media.photos)) {
    for (const p of media.photos) {
      if (p && !photos.includes(p)) {
        photos.push(p);
      }
    }
  }

  const videos: NewsVideo[] = media && Array.isArray(media.videos) ? media.videos : [];

  // Извлекаем хэштеги в конце или в теле текста
  const tagMatches = cleanContent.match(/#[а-яА-ЯёЁa-zA-Z0-9_]+/g);
  const tags: string[] = [];
  if (tagMatches) {
    for (const t of tagMatches) {
      const norm = t.trim();
      if (!tags.includes(norm)) tags.push(norm);
    }
  }

  return {
    text: cleanVkMentions(cleanContent),
    photos,
    videos,
    tags,
  };
}
