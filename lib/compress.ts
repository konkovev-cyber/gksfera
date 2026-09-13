/**
 * Клиентское сжатие изображений перед загрузкой.
 * - Resize до maxDim (по наибольшей стороне), если исходник больше.
 * - PNG с прозрачностью сохраняем PNG (чтобы не потерять alpha).
 *   Прочие форматы → JPEG q=quality.
 * - Если «сжатый» файл оказался больше оригинала — возвращаем оригинал.
 */
export type CompressOptions = {
  maxDim?: number;   // максимальная сторона, default 1920
  quality?: number;  // 0..1 для JPEG/WebP, default 0.85
  minBytes?: number; // если меньше — не трогаем (уже компактно), default 200_000
};

export async function compressImageFile(
  file: File,
  opts: CompressOptions = {},
): Promise<{ file: File; savedBytes: number }> {
  const maxDim = opts.maxDim ?? 1920;
  const quality = opts.quality ?? 0.85;
  const minBytes = opts.minBytes ?? 200_000;

  const origBytes = file.size;
  if (!file.type.startsWith("image/")) return { file, savedBytes: 0 };
  if (file.type === "image/gif") return { file, savedBytes: 0 }; // не ломаем анимацию
  if (file.size < minBytes) return { file, savedBytes: 0 };

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (!w || !h) return { file, savedBytes: 0 };

    const scale = Math.min(1, maxDim / Math.max(w, h));
    w = Math.round(w * scale);
    h = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, savedBytes: 0 };
    ctx.drawImage(img, 0, 0, w, h);

    // PNG сохраняем PNG (альфа), остальное — JPEG (меньше)
    const isPng = file.type === "image/png";
    const mime = isPng ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((res) => {
      canvas.toBlob((b) => res(b), mime, quality);
    });
    if (!blob) return { file, savedBytes: 0 };
    if (blob.size >= origBytes) return { file, savedBytes: 0 };

    const newName = file.name.replace(/\.[^.]+$/, isPng ? ".png" : ".jpg");
    const out = new File([blob], newName, { type: mime, lastModified: Date.now() });
    return { file: out, savedBytes: origBytes - blob.size };
  } catch {
    return { file, savedBytes: 0 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const IMAGE_MAX = 20 * 1024 * 1024;  // 20MB после сжатия
export const VIDEO_MAX = 50 * 1024 * 1024;  // 50MB для видео
export const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
export const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

export const isVideoFile = (f: File) =>
  f.type.startsWith("video/") || VIDEO_EXT_RE.test(f.name);
export const isVideoSrc = (src: string) => VIDEO_EXT_RE.test(src);
export const isImageSrc = (src: string) =>
  IMAGE_EXT_RE.test(src) && !src.startsWith("data:");

export const humanSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
