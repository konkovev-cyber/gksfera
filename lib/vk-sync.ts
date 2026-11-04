import { serviceClient } from "./supabase-server";
// Внутри lib держим относительные пути (как в markdown.ts → ./utils):
// так файл можно использовать и из скриптов вне сборщика.
import { getPinnedNewsKeys } from "./news-lock";
import { mirrorVkImage, resetFilesCache } from "./mirror-media";
import { cleanVkMentions, type NewsVideo, type NewsMedia } from "./news";

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

/** Извлекает максимальный размер фото из attachments VK */
function getBestPhotoUrl(photo: Record<string, unknown>): string | null {
  const sizes = (photo.sizes ?? []) as Array<Record<string, unknown>>;
  const preferred = ["w", "z", "y", "x"];
  for (const p of preferred) {
    const found = sizes.find((s) => s.type === p);
    if (found?.url) return String(found.url).replace(/^http:\/\//i, "https://");
  }
  if (sizes.length > 0) {
    const last = sizes[sizes.length - 1];
    if (last?.url) return String(last.url).replace(/^http:\/\//i, "https://");
  }
  return null;
}

/** Извлекает все фото и видео из attachments поста (включая репосты) */
function extractPostMedia(post: Record<string, unknown>): {
  photos: string[];
  videos: NewsVideo[];
} {
  const photos: string[] = [];
  const videos: NewsVideo[] = [];
  const attachments = (post.attachments ?? []) as Array<Record<string, unknown>>;

  for (const att of attachments) {
    if (att.type === "photo" && att.photo) {
      const u = getBestPhotoUrl(att.photo as Record<string, unknown>);
      if (u && !photos.includes(u)) photos.push(u);
    }
    if (att.type === "video" && att.video) {
      const v = att.video as Record<string, unknown>;
      let previewImg: string | undefined;
      const images = (v.image ?? []) as Array<Record<string, unknown>>;
      const big = images.find((i) => (i.width as number) >= 800) || images[images.length - 1];
      if (big?.url) previewImg = String(big.url).replace(/^http:\/\//i, "https://");

      const rawTitle = String(v.title ?? "").trim();
      const isSystemTitle =
        /^Video by/i.test(rawTitle) ||
        /^Clip by/i.test(rawTitle) ||
        /^Видео/i.test(rawTitle);

      videos.push({
        title: isSystemTitle ? "" : rawTitle,
        url: `https://vk.com/video${v.owner_id}_${v.id}`,
        image: previewImg,
        duration: typeof v.duration === "number" ? v.duration : undefined,
      });
    }
  }

  // Если репост (copy_history)
  const copyHistory = (post.copy_history ?? []) as Array<Record<string, unknown>>;
  if (copyHistory.length > 0) {
    const orig = copyHistory[0];
    const origMedia = extractPostMedia(orig);
    for (const p of origMedia.photos) {
      if (!photos.includes(p)) photos.push(p);
    }
    videos.push(...origMedia.videos);
  }

  return { photos, videos };
}

/**
 * Интеллектуально извлекает текст и заголовок поста.
 * Если текст поста пуст (например, клип или видео без описания на стене),
 * берет описание из прикрепленного видео/клипа или репоста.
 */
function extractPostTextAndTitle(
  post: Record<string, unknown>,
  media: { photos: string[]; videos: NewsVideo[] }
): { text: string; title: string } {
  let rawText = stripHtml(decodeHtml(String(post.text ?? "")));

  // Если текст пуст на стене, проверяем текст репоста
  const copyHistory = (post.copy_history ?? []) as Array<Record<string, unknown>>;
  if (!rawText && copyHistory.length > 0) {
    rawText = stripHtml(decodeHtml(String(copyHistory[0].text ?? "")));
  }

  // Если всё ещё пуст, ищем в описаниях видеозаписей
  if (!rawText && media.videos.length > 0) {
    const attachments = (post.attachments ?? []) as Array<Record<string, unknown>>;
    const vWithDesc = attachments.find(
      (a: any) => a.type === "video" && a.video?.description
    ) as any;
    if (vWithDesc?.video?.description) {
      rawText = stripHtml(decodeHtml(String(vWithDesc.video.description)));
    } else {
      const vWithTitle = media.videos.find((v) => v.title);
      if (vWithTitle?.title) rawText = vWithTitle.title;
    }
  }

  rawText = cleanVkMentions(rawText).trim();

  // Формируем заголовок из первой осмысленной строки текста
  let title = "";
  if (rawText) {
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#")); // отсекаем строки только из тегов
    if (lines.length > 0) {
      title = lines[0].slice(0, 120).trim();
    }
  }

  // Если текст не дал заголовка
  if (!title) {
    if (media.videos.length > 0 && media.videos[0].title) {
      title = media.videos[0].title;
    } else if (media.videos.length > 0) {
      title = "Видеозапись из жизни студии";
    } else if (media.photos.length > 0) {
      title = "Фотоотчёт студии «Сфера»";
    } else {
      title = "Событие студии «Сфера»";
    }
  }

  return { text: rawText, title };
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

export type VkTarget = {
  domain?: string;
  ownerId?: number;
};

/**
 * Интеллектуальный разбор ссылки или имени сообщества VK.
 * Поддерживает:
 * - короткие имена: sferaznanei, @sferaznanei
 * - полные ссылки: https://vk.com/sferaznanei, https://vk.ru/sferaznanei
 * - ссылки на стену: https://vk.com/wall-221386348_134
 * - группы: https://vk.com/club221386348, public221386348
 * - числовые id: -221386348, 221386348
 */
export function parseVkTarget(raw?: string | null): VkTarget {
  if (!raw) return { domain: "sferaznanei" };
  let s = raw.trim();
  s = s.replace(/^https?:\/\/(?:m\.)?(?:vk\.com|vk\.ru)\//i, "");
  s = s.replace(/^@/, "");
  s = s.split("?")[0].split("#")[0].trim();
  s = s.replace(/^\/+|\/+$/g, "");

  const wallMatch = s.match(/^wall(-?\d+)(?:_\d+)?$/i);
  if (wallMatch) {
    const id = parseInt(wallMatch[1], 10);
    return { ownerId: id < 0 ? id : -id };
  }
  const groupMatch = s.match(/^(?:club|public)(\d+)$/i);
  if (groupMatch) {
    return { ownerId: -parseInt(groupMatch[1], 10) };
  }
  if (/^-\d+$/.test(s)) return { ownerId: parseInt(s, 10) };
  if (/^\d+$/.test(s)) return { ownerId: -parseInt(s, 10) };
  if (s.toLowerCase() === "sfera_gk") s = "sferaznanei";
  return { domain: s || "sferaznanei" };
}

/** Очищает и извлекает shortname/id домена из строки или URL (для совместимости) */
export function cleanVkDomain(raw?: string | null): string {
  const target = parseVkTarget(raw);
  if (target.ownerId !== undefined) {
    return String(target.ownerId);
  }
  return target.domain || "sferaznanei";
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

  const rawTarget = domainArg || process.env.VK_COMMUNITY_DOMAIN || "sferaznanei";
  const target = parseVkTarget(rawTarget);
  const count = Math.min(countArg || 10, 100);

  const params = new URLSearchParams({
    count: String(count),
    extended: "1",
    v: VK_VERSION,
    access_token: serviceKey,
  });

  if (target.ownerId !== undefined) {
    params.set("owner_id", String(target.ownerId));
  } else {
    params.set("domain", target.domain || "sferaznanei");
  }

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

  const parsed = items
    .filter((post) => !post.is_pinned)
    .map((post) => {
      const media = extractPostMedia(post);
      const { text, title } = extractPostTextAndTitle(post, media);
      const sourceUrl = `https://vk.com/wall${post.owner_id}_${post.id}`;

      // В качестве обложки берем первое фото или превью первого видео
      let cover = media.photos[0] || media.videos[0]?.image || null;

      const date = post.date
        ? new Date((post.date as number) * 1000).toISOString()
        : new Date().toISOString();

      return {
        vk_post_id: String(post.id),
        title,
        text,
        excerpt: text.slice(0, 200) + (text.length > 200 ? "…" : ""),
        cover,
        raw_photos: media.photos,
        raw_videos: media.videos,
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

  // Параллельное зеркалирование всех картинок поста (обложка + фотоальбом)
  const mirrored_parsed = await Promise.all(
    parsed.map(async (p) => {
      // Закреплённые студией записи не трогаем вовсе:
      if (existingMap.has(p.vk_post_id) && pinned.includes(p.vk_post_id)) {
        skipped++;
        return null;
      }

      // Зеркалируем все фото поста параллельно
      const photoResults = await Promise.all(
        p.raw_photos.map(async (photoUrl) => {
          const mine = await mirrorVkImage(photoUrl);
          return { original: photoUrl, mine };
        })
      );
      const mirroredPhotos: string[] = photoResults.map((r) => {
        if (r.mine) {
          if (r.mine.downloaded) mirrored++;
          else reused++;
          return r.mine.url;
        }
        return r.original;
      });

      // Обложка — первое отзеркалированное фото (или превью видео, если фото не было)
      let finalCover = mirroredPhotos[0] || null;
      if (!finalCover && p.cover) {
        const mineCover = await mirrorVkImage(p.cover);
        if (mineCover) {
          finalCover = mineCover.url;
          if (mineCover.downloaded) mirrored++;
          else reused++;
        } else {
          finalCover = p.cover;
        }
      }

      // Зеркалируем превью видео, если они есть
      const finalVideos: NewsVideo[] = [];
      for (const vid of p.raw_videos) {
        let vidImg = vid.image;
        if (vidImg) {
          const mine = await mirrorVkImage(vidImg);
          if (mine) {
            vidImg = mine.url;
            if (mine.downloaded) mirrored++;
            else reused++;
          }
        }
        finalVideos.push({ ...vid, image: vidImg });
      }

      // Формируем метаданные медиа
      const mediaMeta: NewsMedia = {};
      if (mirroredPhotos.length > 0) mediaMeta.photos = mirroredPhotos;
      if (finalVideos.length > 0) mediaMeta.videos = finalVideos;

      let finalContent = p.text;
      if (mediaMeta.photos?.length || mediaMeta.videos?.length) {
        finalContent += `\n\n<!-- vk_media:${JSON.stringify(mediaMeta)} -->`;
      }

      return {
        vk_post_id: p.vk_post_id,
        title: p.title,
        content: finalContent,
        excerpt: p.excerpt,
        image_url: finalCover,
        source_url: p.source_url,
        published_at: p.published_at,
      };
    })
  );

  const toProcess = mirrored_parsed.filter((p): p is NonNullable<typeof p> => p !== null);
  const toInsert = toProcess.filter((p) => !existingMap.has(p.vk_post_id));
  const toUpdate = toProcess.filter((p) => existingMap.has(p.vk_post_id));

  // Батч-upsert новых постов — один INSERT вместо N.
  if (toInsert.length > 0) {
    const { error: insErr } = await db.from("news").insert(toInsert.map((p) => ({ ...p, visible: true })));
    if (insErr) {
      return { ok: false, error: `Ошибка БД при сохранении новостей: ${insErr.message}` };
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

  return { ok: true, imported, updated, skipped, mirrored, reused, total: parsed.length };
}
