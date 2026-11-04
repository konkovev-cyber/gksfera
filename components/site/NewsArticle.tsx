import React from "react";
import { mdToHtml, NEWS_BODY_CLASS } from "@/lib/markdown";
import { isVkNews, parseNewsMedia } from "@/lib/news";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/data/site";

/**
 * Превращает ссылки и номера телефонов в кликабельные элементы
 */
function renderVkRichText(text: string) {
  // Регулярка для URL и телефонов формата +7 / 8 (...) ...
  const regex = /(https?:\/\/[^\s<]+|(?:vk\.com|vk\.ru)\/[^\s<]+|\+7\s*\(?\d{3}\)?\s*\d{3}[-\s]?\d{2}[-\s]?\d{2}|8\s*\(?\d{3}\)?\s*\d{3}[-\s]?\d{2}[-\s]?\d{2})/gi;

  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (!part) return null;

    // Проверяем, URL ли это
    if (/^(https?:\/\/|(?:vk\.com|vk\.ru)\/)/i.test(part)) {
      const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium break-all"
        >
          {part}
        </a>
      );
    }

    // Проверяем, телефон ли это
    if (/^(\+7|8)\s*\(?\d{3}\)?/i.test(part)) {
      const cleanPhone = part.replace(/\D/g, "");
      const tel = cleanPhone.startsWith("8") ? `+7${cleanPhone.slice(1)}` : `+${cleanPhone}`;
      return (
        <a
          key={i}
          href={`tel:${tel}`}
          className="text-primary hover:underline font-medium"
        >
          {part}
        </a>
      );
    }

    return part;
  });
}

/**
 * Показ тела новости. Один файл на сайт и на предпросмотр в админке — иначе
 * редактор «рисует одно, а сайт показывает другое».
 *
 * Два режима:
 *  • новость, написанная на сайте, — Markdown (**жирный**, списки, фото);
 *  • новость, импортированная из VK, — автолинковка URL и телефонов,
 *    аккуратная типографика и список тегов.
 */
export function NewsBody({ item, className }: { item: NewsItem; className?: string }) {
  if (isVkNews(item)) {
    const { text, tags } = parseNewsMedia(item);

    if (!text) {
      return (
        <p className={cn(NEWS_BODY_CLASS, "text-muted-foreground italic", className)}>
          Подробности и обсуждение этой заметки — в группе ВКонтакте, кнопка ниже.
        </p>
      );
    }

    return (
      <div className={cn(NEWS_BODY_CLASS, className)}>
        <div style={{ whiteSpace: "pre-line" }}>{renderVkRichText(text)}</div>
        {tags.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <a
                key={tag}
                href={`https://vk.com/feed?section=search&q=${encodeURIComponent(tag)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  const text = String(item.content || item.excerpt || "").trim();
  if (!text) {
    return (
      <p className={cn(NEWS_BODY_CLASS, "text-muted-foreground italic", className)}>
        Текст этой заметки пока не заполнен.
      </p>
    );
  }

  return (
    <div
      className={cn(NEWS_BODY_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: mdToHtml(text) }}
    />
  );
}

/** Отметка «написано на сайте» / «из VK» — чтобы лента не выглядела однородной. */
export function NewsSourceBadge({ item, className }: { item: NewsItem; className?: string }) {
  const vk = isVkNews(item);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        vk ? "bg-brand-teal/10 text-brand-teal-ink" : "bg-brand-warm/12 text-brand-warm-ink",
        className,
      )}
    >
      {vk ? "из VK" : "студия"}
    </span>
  );
}
