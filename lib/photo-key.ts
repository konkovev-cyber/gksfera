/**
 * Имя файла → ключ хранилища Supabase.
 *
 * Хранилище принимает только ASCII: «Олег 2024.jpg» с кириллицей в ключе ответит
 * 400 InvalidKey (проверено на реальном бакете — см. pptr-check/storage-unicode-key.js).
 * Прежний санитар просто выкидывал все не-\w символы, и русское имя схлопывалось
 * в «_.jpg»: в админке такой снимок не опознать. Поэтому кириллицу сначала
 * транслитерируем, и только потом срезаем всё остальное.
 */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

/** Кириллица → латиница в стиле файловых имён (с сохранением регистра). */
export function transliterate(name: string): string {
  return name.replace(/[а-яё]/gi, (ch) => {
    const mapped = TRANSLIT[ch.toLowerCase()];
    if (mapped === undefined) return "_";
    return ch === ch.toLowerCase() ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
  });
}

/**
 * Ключ для `<timestamp>-…`: ASCII, без слэшей и управляющих символов, с
 * сохранённым расширением. Пустое имя (только точки и знаки) — «foto».
 */
export function safePhotoKey(filename: string): string {
  const raw = String(filename || "").replace(/[\\/]/g, "_").trim();
  const dot = raw.lastIndexOf(".");
  const hasExt = dot > 0 && dot < raw.length - 1 && raw.slice(dot).length <= 6;
  const base = hasExt ? raw.slice(0, dot) : raw;
  const ext = hasExt ? raw.slice(dot + 1) : "";
  const cleanBase = (s: string) =>
    transliterate(s)
      .replace(/[^\w.\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^[_.]+|[_.]+$/g, "")
      .slice(0, 56)
      // Обрезка по длине могла оставить висячий разделитель — добираем.
      .replace(/[_.\-]+$/, "") || "foto";
  // Расширение обязательно оставляем с точкой: на него смотрит код, который
  // решает, картинка это или видео (isVideoSrc, IMAGE_EXT_RE), и оно же
  // подставляется в Content-Type при загрузке.
  const cleanExt = transliterate(ext).replace(/[^\w]+/g, "").slice(0, 5);
  return `${cleanBase(base)}${cleanExt ? "." + cleanExt : ""}`;
}
