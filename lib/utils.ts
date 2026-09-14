import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** «Подготовка к школе» → «podgotovka-k-shkole» (для URL страниц направлений). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Безопасная сериализация для <script type="application/ld+json">.
 * Экранирует <, >, &, чтобы последовательность </script> (или "<" из
 * пользовательского текста — название из VK, отзыв, заголовок) не могла
 * закрыть тег и внедрить разметку/скрипт в HTML страницы.
 */
export function ldScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/[<>&]/g, (c) =>
    c === '<' ? '\\u003c' : c === '>' ? '\\u003e' : '\\u0026',
  );
}

/** Экранирование HTML-текста (для ручного рендера Markdown). */
export function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Пропускаем только безобидные схемы ссылок; остальное (javascript:, data:) — в #. */
export function safeHref(url: string): string {
  const u = String(url ?? "").trim();
  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(u)) return u;
  return "#";
}
