import { serviceClient } from "./supabase-server";
// Внутри lib держим относительные пути (как в markdown.ts → ./utils):
// так файл можно использовать и из скриптов вне сборщика.
import { getPinnedNewsKeys } from "./news-lock";
import { mirrorVkImage, resetFilesCache } from "./mirror-media";

const service = serviceClient;

const VK_VERSION = "5.199";

/** Декодирует HTML-entities VK */
function decodeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, c) => String.fromCharCode(parseInt(c, 16)));
}

/** Убирает HTML-теги, оставляя переносы строк */
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/** Тип медиа-строки в news_media. */
export type MediaEntry = { url: string; type: "image" | "video" };

/**
 * Собирает ВСЕ медиа из вложений поста и его репостов (copy_history):
 *  • photo → картинка (зеркалим к себе);
 *  • video → ссылка на страницу VK (страница встраивается через video_ext.php);
 *  • doc / audio / link → текстовая строка в теле новости (у VK-ссылок на
 *    файлы нет расширений, а музыки VK обычно не отдаёт прямых URL).
 * Дубли убираются по url. Возвращает url превью первого видео (для обложки,
 * когда фотографий в посте нет).
 */
function collectMedia(
  post: Record<string, unknown>,
  mediaList: MediaEntry[],
  linkLines: string[],
): string | null {
  let firstVideoThumb: string | null = null;

  const pushMedia = (entry: MediaEntry) => {
    if (!mediaList.some((m) => m.url === entry.url)) mediaList.push(entry);
  };

  const processAttachments = (attachments: Array<Record<string, unknown>>) => {
    for (const att of attachments) {
      if (att.type === "photo" && att.photo) {
        const photo = att.photo as Record<string, unknown>;
        const sizes = (photo.sizes ?? []) as Array<Record<string, unknown>>;
        const preferred = ["w", "z", "y", "x"];
        for (const p of preferred) {
          const found = sizes.find((s) => s.type === p);
          if (found?.url) {
            pushMedia({ url: String(found.url).replace(/^http:\/\//i, "https://"), type: "image" });
            break;
          }
        }
        if (!sizes.some((s) => preferred.includes(String(s.type))) && sizes.length > 0) {
          const last = sizes[sizes.length - 1];
          if (last?.url) pushMedia({ url: String(last.url).replace(/^http:\/\//i, "https://"), type: "image" });
        }
      }
      if (att.type === "video" && att.video) {
        const video = att.video as Record<string, unknown>;
        const images = (video.image ?? []) as Array<Record<string, unknown>>;
        const videoLink = `https://vk.com/video${video.owner_id}_${video.id}`;
        pushMedia({ url: videoLink, type: "video" });
        if (!firstVideoThumb) {
          const big = images.find((i) => (i.width as number) >= 1280 || (i.width as number) >= 800);
          const thumb = big?.url ?? (images.length > 0 ? images[images.length - 1].url : null);
          if (thumb) firstVideoThumb = String(thumb).replace(/^http:\/\//i, "https://");
        }
      }
      if (att.type === "doc" && att.doc) {
        const doc = att.doc as Record<string, unknown>;
        const docUrl = String(doc.url ?? "").replace(/^http:\/\//i, "https://");
        if (docUrl) linkLines.push(`📄 Файл: ${String(doc.title ?? "документ")} — ${docUrl}`);
      }
      if (att.type === "audio" && att.audio) {
        const audio = att.audio as Record<string, unknown>;
        const audioUrl = String(audio.url ?? "").replace(/^http:\/\//i, "https://");
        if (audioUrl) {
          linkLines.push(`🎵 Аудио: ${String(audio.artist ?? "")} — ${String(audio.title ?? "")} — ${audioUrl}`);
        }
      }
      if (att.type === "link" && att.link) {
        const link = att.link as Record<string, unknown>;
        const linkUrl = String(link.url ?? "").replace(/^http:\/\//i, "https://");
        if (linkUrl) linkLines.push(`🔗 ${String(link.title ?? linkUrl)} — ${linkUrl}`);
      }
    }
  };

  const attachments = post.attachments as Array<Record<string, unknown>> | undefined;
  if (attachments) processAttachments(attachments);

  const copyHistory = post.copy_history as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(copyHistory)) {
    for (const rep of copyHistory) {
      const repAtts = rep.attachments as Array<Record<string, unknown>> | undefined;
      if (repAtts) processAttachments(repAtts);
      const repText = String(rep.text ?? "");
      if (repText) linkLines.push(stripHtml(decodeHtml(repText)));
    }
  }

  return firstVideoThumb;
}

export type SyncResult = {
  ok: boolean;
  /** новых строк в базе */
  imported?: number;
  /** обновлённых по посту VK */
  updated?: number;
  /** пропущено из-за закрепления студией */
  skipped?: number;
  /** картинок скачано к себе впервые */
  mirrored?: number;
  /** картинок уже лежат у нас — повторная загрузка не понадобилась */
  reused?: number;
  total?: number;
  error?: string;
};

/** Очищает и извлекает shortname/id домена из строки или URL */
export function cleanVkDomain(raw?: string | null): string {
  if (!raw) return "";
  let d = raw.trim();
  const match = d.match(/(?:vk\.com|vk\.ru)\/([a-zA-Z0-9_\.-]+)/i);
  if (match) {
    d = match[1];
  }
  d = d.replace(/^https?:\/\//i, "").replace(/^\/+|\/+$/g, "");
  d = d.replace(/^@/, "");
  d = d.split("?")[0].split("#")[0].trim();
  return d;
}

/**
 * Тянет последние посты со стены VK и upsert'ит их в таблицу news.
 * Используется и админ-кнопкой, и cron-задачей.
 */
export async function syncVkNews(
  domainArg?: string,
  countArg?: number
): Promise<SyncResult> {
  const serviceKey = process.env.VK_SERVICE_KEY;
  if (!serviceKey) {
    return { ok: false, error: "VK_SERVICE_KEY не задан" };
  }

  const rawDomain = domainArg || process.env.VK_COMMUNITY_DOMAIN || "sferaznanei";
  let domain = cleanVkDomain(rawDomain);
  // Защита: старая заглушка "sfera_gk" не существует в VK и даёт ошибку 100
  if (!domain || domain.toLowerCase() === "sfera_gk") {
    domain = "sferaznanei";
  }
  const count = Math.min(countArg || 10, 100);

  const params = new URLSearchParams({
    domain,
    count: String(count),
    extended: "1",
    v: VK_VERSION,
    access_token: serviceKey,
  });
  const apiUrl = `https://api.vk.com/method/wall.get?${params}`;

  let vkData: Record<string, unknown>;
  try {
    const res = await fetch(apiUrl);
    vkData = (await res.json()) as Record<string, unknown>;
  } catch (e: unknown) {
    return { ok: false, error: `Ошибка запроса к VK: ${(e as Error).message}` };
  }

  if (vkData.error) {
    const err = vkData.error as Record<string, unknown>;
    return { ok: false, error: `VK API: ${err.error_msg} (${err.error_code})` };
  }

  const response = vkData.response as Record<string, unknown> | undefined;
  const items = (response?.items ?? []) as Array<Record<string, unknown>>;
  if (items.length === 0) {
    return { ok: true, imported: 0, total: 0 };
  }

  const mediaMap = new Map<string, MediaEntry[]>();
  const parsed = items
    .filter((post) => !post.is_pinned)
    .map((post) => {
      const text = stripHtml(decodeHtml(String(post.text ?? "")));
      const sourceUrl = `https://vk.com/wall${post.owner_id}_${post.id}`;

      const mediaList: MediaEntry[] = [];
      const linkLines: string[] = [];
      const videoThumb = collectMedia(post, mediaList, linkLines);
      // Ссылки/файлы/аудио и текст репоста дописываем в тело новости:
      // так «все мультимедиа» видны даже без галереи.
      const body = linkLines.length > 0 ? (text + "\n\n" + linkLines.join("\n")).trim() : text;

      let title = "Новость Сферы";
      if (text) {
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length > 0) title = lines[0].slice(0, 120).trim();
      }

      const cover = mediaList.find((m) => m.type === "image")?.url || videoThumb || null;
      const date = post.date
        ? new Date((post.date as number) * 1000).toISOString()
        : new Date().toISOString();

      mediaMap.set(String(post.id), mediaList);

      return {
        vk_post_id: String(post.id),
        title,
        content: body,
        excerpt: text.slice(0, 200) + (text.length > 200 ? "…" : ""),
        image_url: cover,
        source_url: sourceUrl,
        published_at: date,
      };
    });

  const db = service();
  const pinned = await getPinnedNewsKeys().catch(() => [] as string[]);
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let mirrored = 0;
  let reused = 0;

  // Сбрасываем кэш зеркала картинок перед синхронизацией:
  // будем писать новые файлы, поэтому кэш станет устаревшим.
  resetFilesCache();

  // Батч-запрос существующих постов — один SELECT вместо N.
  const allIds = parsed.map((p) => p.vk_post_id);
  const { data: existingRows } = await db
    .from("news")
    .select("id,vk_post_id")
    .in("vk_post_id", allIds);
  const existingMap = new Map<string, string>(
    (existingRows ?? []).map((r) => [String(r.vk_post_id), String(r.id)])
  );

  // Параллельное зеркалирование картинок: все посты одновременно,
  // а не последовательно один за другим.
  const mirrored_parsed = await Promise.all(
    parsed.map(async (p) => {
      // Закреплённые студией записи не трогаем вовсе:
      // админ мог поправить текст, заменить обложку или дату.
      if (existingMap.has(p.vk_post_id) && pinned.includes(p.vk_post_id)) {
        skipped++;
        return null; // пропускаем
      }

      // Зеркалим ВСЕ фото поста, а не только обложку: иначе галерея
      // ссылается на временные подписи VK, которые через полгода отвалятся.
      for (const m of mediaMap.get(p.vk_post_id) ?? []) {
        if (m.type !== "image") continue;
        const mine = await mirrorVkImage(m.url);
        if (mine) {
          if (mine.url !== m.url) m.url = mine.url;
          if (mine.downloaded) mirrored++;
          else reused++;
        }
      }

      const mine = await mirrorVkImage(p.image_url);
      if (mine) {
        if (mine.url !== p.image_url) p.image_url = mine.url;
        if (mine.downloaded) mirrored++;
        else reused++;
      }
      return p;
    })
  );

  const toProcess = mirrored_parsed.filter((p): p is typeof parsed[0] => p !== null);
  const toInsert = toProcess.filter((p) => !existingMap.has(p.vk_post_id));
  const toUpdate = toProcess.filter((p) => existingMap.has(p.vk_post_id));

  // Медиа-блок в конце тела новости: пока таблицы news_media нет (или для
  // надёжности), фото/видео дублируем ссылками в текст — страница разложит
  // их в галерею и плеер и уберёт этот блок из показа. Здесь url уже наши
  // (зеркалированные), поэтому блок переживает отзыв подписей VK.
  for (const p of toProcess) {
    const list = mediaMap.get(p.vk_post_id) ?? [];
    const photos = list.filter((m) => m.type === "image").map((m) => m.url);
    const vids = list.filter((m) => m.type === "video").map((m) => m.url);
    let block = "";
    if (photos.length > 0) block += "\n\nИзображения:\n" + photos.join("\n");
    if (vids.length > 0) block += (block ? "\n" : "\n\n") + "Видео:\n" + vids.join("\n");
    if (block) p.content = (p.content + block).trim();
  }

  // Батч-upsert новых постов — один INSERT вместо N.
  if (toInsert.length > 0) {
    const { data: insertedRows, error: insErr } = await db
      .from("news")
      .insert(toInsert.map((p) => ({ ...p, visible: true })))
      .select("id,vk_post_id");
    if (insErr) {
      return { ok: false, error: `Ошибка БД при сохранении новостей: ${insErr.message}` };
    }
    for (const row of insertedRows ?? []) {
      existingMap.set(String(row.vk_post_id), String(row.id));
    }
    imported = toInsert.length;
  }

  // Обновления существующих записей по их первичному ключу id
  if (toUpdate.length > 0) {
    const updateResults = await Promise.all(
      toUpdate.map(async (p) => {
        const id = existingMap.get(p.vk_post_id);
        if (id) {
          const { error: upErr } = await db.from("news").update(p).eq("id", id);
          if (upErr) {
            console.error(`Ошибка обновления новости ${id}:`, upErr);
            return false;
          }
          return true;
        }
        return false;
      })
    );
    updated = updateResults.filter(Boolean).length;
  }

  // Дозапись недостающих медиа в news_media (галерея/видео на странице новости).
  // Существующие строки не трогаем: если зеркалирование фото в этот раз
  // не удалось, старые ссылки остаются в базе и новость не «лысеет».
  const newsIds = toProcess
    .map((p) => existingMap.get(p.vk_post_id))
    .filter((v): v is string => Boolean(v));
  if (newsIds.length > 0) {
    try {
      const { data: mediaRows } = await db
        .from("news_media")
        .select("news_id,media_url")
        .in("news_id", newsIds);
      const existingMedia = new Set(
        (mediaRows ?? []).map((r) => `${r.news_id}:${r.media_url}`)
      );
      const missing: Array<{
        news_id: string;
        media_url: string;
        media_type: string;
        display_order: number;
      }> = [];
      for (const p of toProcess) {
        const id = existingMap.get(p.vk_post_id);
        if (!id) continue;
        (mediaMap.get(p.vk_post_id) ?? []).forEach((m, idx) => {
          const key = `${id}:${m.url}`;
          if (existingMedia.has(key)) return;
          existingMedia.add(key);
          missing.push({
            news_id: id,
            media_url: m.url,
            media_type: m.type,
            display_order: idx,
          });
        });
      }
      if (missing.length > 0) {
        const { error: mErr } = await db.from("news_media").insert(missing);
        if (mErr && (mErr as { code?: string }).code !== "PGRST205") {
          // PGRST205 = таблицы news_media ещё нет (миграция не применена) —
          // это не ошибка синхронизации: все медиа уже есть в content.
          console.error("Ошибка записи news_media:", mErr);
        }
      }
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "PGRST205") console.error("Ошибка записи news_media:", e);
    }
  }

  return { ok: true, imported, updated, skipped, mirrored, reused, total: parsed.length };
}
