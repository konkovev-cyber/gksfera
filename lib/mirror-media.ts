import crypto from "crypto";
import { serviceClient } from "./supabase-server";

/**
 * Зеркалирование картинок из VK в наш Supabase Storage.
 *
 * Проблема: синхронизация сохраняет в news ссылки вида
 * https://sun9-12.userapi.com/impg/…/&sign=…. — это временные подписи VK.
 * VK может их отозвать или запретить hotlink'и, и тогда через полгода у новостей
 * просто не будет иллюстраций: на сайте останутся пустые карточки и разбитые og:image.
 * Поэтому при импорте картинку скачиваем и кладём в свой bucket `media` (папку news),
 * а в базу пишем уже наш адрес.
 *
 * Фолбэк безопасный: если скачать/загрузить не удалось — оставляем ссылку VK,
 * новость всё равно импортируется.
 */
const BUCKET = "media";
const FOLDER = "news";
const MAX_BYTES = 15 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;

const service = serviceClient;

/** Чужая ли это ссылка (т.е. висит на стороне VK и может отвалиться). */
export function isForeignMediaUrl(u: unknown): boolean {
  const s = String(u ?? "").trim();
  if (!/^https?:\/\//i.test(s)) return false;
  try {
    const h = new URL(s).hostname.toLowerCase();
    return /(^|\.)userapi\.com$/.test(h) || /(^|\.)vk\.com$/.test(h) || /(^|\.)vk\.me$/.test(h);
  } catch {
    return false;
  }
}

/** Ссылка уже на наше хранилище — её трогать не нужно. */
export function isOurMediaUrl(u: unknown): boolean {
  const s = String(u ?? "");
  return s.includes(`/storage/v1/object/public/${BUCKET}/`) || s.includes(`/storage/v1/object/${BUCKET}/`);
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

let cachedFiles: string[] | null = null;
let filesPromise: Promise<string[]> | null = null;

async function folderFiles(db: ReturnType<typeof service>): Promise<string[]> {
  if (cachedFiles) return cachedFiles;
  if (!filesPromise) {
    filesPromise = db.storage
      .from(BUCKET)
      .list(FOLDER, { limit: 1000, sortBy: { column: "name", order: "asc" } })
      .then(({ data }) => {
        cachedFiles = (data ?? []).map((f) => String(f.name));
        return cachedFiles;
      });
  }
  return filesPromise;
}

/** Сбрасывает кэш файлов (вызывать перед/после каждой синхронизации). */
export function resetFilesCache() {
  cachedFiles = null;
  filesPromise = null;
}

function publicUrl(db: ReturnType<typeof service>, path: string): string {
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Возвращает наш URL для картинки из VK — или null, если зеркалить не удалось
 * (тогда вызывающий оставляет ссылку VK). downloaded=false означает, что файл
 * уже лежит у нас: повторная синхронизация не качает его заново.
 */
export async function mirrorVkImage(
  url: string | null | undefined,
): Promise<{ url: string; downloaded: boolean } | null> {
  const src = String(url ?? "").trim();
  if (!isForeignMediaUrl(src)) return src ? { url: src, downloaded: false } : null;

  const db = service();
  const hash = crypto.createHash("sha1").update(src).digest("hex").slice(0, 20);

  try {
    const files = await folderFiles(db);
    // Тот же адрес VK даёт тот же файл: если он уже у нас — не качаем заново.
    const existing = files.find((n) => n.startsWith(hash + "."));
    if (existing) return { url: publicUrl(db, `${FOLDER}/${existing}`), downloaded: false };

    const res = await fetch(src, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "sfera-site/1.0 (mirror)" },
    });
    if (!res.ok) return null;

    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!type.startsWith("image/")) return null;
    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length || buf.length > MAX_BYTES) return null;

    const ext = EXT_BY_TYPE[type] ?? (type.includes("png") ? "png" : "jpg");
    const path = `${FOLDER}/${hash}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, buf, {
      contentType: type || "image/jpeg",
      upsert: true, // перезапись допустима: имя выведено из адреса
    });
    if (error) return null;
    if (cachedFiles) cachedFiles.push(`${hash}.${ext}`);
    return { url: publicUrl(db, path), downloaded: true };
  } catch {
    return null; // сеть/VK/Storage — не повод ронять синхронизацию
  }
}
