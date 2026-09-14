import { escapeHtml } from "./utils";

/**
 * Минимальный Markdown для текстов, которые пишут люди в админке.
 * Извлечено из app/blog/[slug]/page.tsx и дополнено картинками и цитатами.
 *
 * Безопасность — по тому же принципу: СНАЧАЛА экранируется весь ввод
 * (любой <script> или <img onerror> превращается в текст), потом собираются
 * только наши теги. Отдельно закрыта дырка, которая была в прежней версии:
 * href подставлялся в атрибут без экранирования кавычки, поэтому ссылка вида
 * `[x](/a" onmouseover="alert(1))` ломала атрибут и вставляла свой. Теперь
 * адрес проверяется по схеме И экранируется, а кавычки/пробелы внутри отбрасываются.
 *
 * Поддержка: # ## ### заголовки, **жирный**, *курсив*, `код`, [текст](url),
 * - список, > цитата, ![подпись](url) картинкой на всю ширину.
 * Пустая строка и просто перенос строки означают новый абзац — так привычнее
 * писать в textarea, без правил «два перевода для абзаца».
 */

const SAFE_HREF_RE = /^(https?:\/\/|mailto:|tel:|#|\/)/i;
const SAFE_IMG_RE = /^(https?:\/\/|\/)/i;

function safeHref(raw: string): string {
  const u = String(raw ?? "").trim();
  if (!SAFE_HREF_RE.test(u)) return "#";
  // Кавычек, пробелов и управляющих символов в адресе быть не может.
  if (/["'`\s\u0000-\u001f]/.test(u)) return "#";
  return u;
}

function safeImgSrc(raw: string): string | null {
  const u = String(raw ?? "").trim();
  if (!SAFE_IMG_RE.test(u)) return null;
  if (/["'`\s\u0000-\u001f]/.test(u)) return null;
  return u;
}

/** Инлайн-разметка. Вход уже экранирован. */
function inline(md: string): string {
  let s = md;
  // Жирный раньше курсива, иначе **распадётся на два *
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/_([^_\n]+?)_/g, "<em>$1</em>");
  s = s.replace(/`([^`\n]+?)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-[0.9em] font-mono">$1</code>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    const href = safeHref(url.replace(/&amp;/g, "&"));
    if (href === "#") return text;
    return `<a href="${href}" class="text-brand-warm underline decoration-brand-warm/40 underline-offset-2 hover:decoration-brand-warm" target="_blank" rel="noopener nofollow noreferrer">${text}</a>`;
  });
  return s;
}

const IMG_LINE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

export function mdToHtml(md: string): string {
  const src = escapeHtml(String(md ?? "")).replace(/\r\n?/g, "\n");
  const lines = src.split("\n");
  const out: string[] = [];
  let list: string[] = [];
  let para: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    out.push(`<ul class="my-4 space-y-2">${list.map((li) => `<li class="ml-5 list-disc marker:text-brand-warm">${inline(li)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushPara = () => {
    if (!para.length) return;
    out.push(`<p class="mt-4 first:mt-0 leading-relaxed">${inline(para.join(" "))}</p>`);
    para = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) { flushList(); flushPara(); continue; }

    const img = IMG_LINE_RE.exec(line);
    if (img) {
      flushList(); flushPara();
      const srcUrl = safeImgSrc(img[2].replace(/&amp;/g, "&"));
      const alt = img[1] || "";
      if (srcUrl) {
        out.push(
          `<figure class="my-6"><img src="${srcUrl}" alt="${escapeHtml(alt)}" loading="lazy" class="w-full rounded-2xl border border-border/60 bg-brand-cream/40" />` +
            (alt ? `<figcaption class="mt-2 text-center text-xs text-muted-foreground">${escapeHtml(alt)}</figcaption>` : "") +
            `</figure>`,
        );
      } else {
        para.push(line); // картинка по небезопасному адресу — оставить текстом
      }
      continue;
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      flushList(); flushPara();
      const level = h[1].length;
      const cls =
        level === 1
          ? "font-display font-extrabold text-2xl sm:text-3xl mt-10 mb-4"
          : level === 2
            ? "font-display font-extrabold text-xl sm:text-2xl mt-9 mb-3"
            : "font-display font-bold text-lg mt-7 mb-2";
      const tag = level === 3 ? "h3" : "h2"; // h1 на странице уже занят заголовком новости
      out.push(`<${tag} class="${cls}">${inline(h[2])}</${tag}>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    const q = /^&gt;\s?(.*)$/.exec(line);
    if (q) {
      flushList(); flushPara();
      out.push(
        `<blockquote class="my-6 border-l-4 border-brand-warm/50 bg-brand-warm/5 rounded-r-xl px-5 py-4 italic text-foreground/90">${inline(q[1])}</blockquote>`,
      );
      continue;
    }

    flushList();
    para.push(line);
  }
  flushList();
  flushPara();

  return out.join("");
}

/** Превью в редакторе админки и печать на сайте идут через одну функцию. */
export const NEWS_BODY_CLASS = "text-base sm:text-lg text-foreground/90 leading-relaxed";
