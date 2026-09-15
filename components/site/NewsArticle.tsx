import { mdToHtml, NEWS_BODY_CLASS } from "@/lib/markdown";
import { isVkNews } from "@/lib/news";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/data/site";

/**
 * Показ тела новости. Один файл на сайт и на предпросмотр в админке — иначе
 * редактор «рисует одно, а сайт показывает другое».
 *
 * Два режима намеренные:
 *  • новость, написанная на сайте, — Markdown (**жирный**, списки, фото);
 *  • новость, импортированную из VK, — простым текстом. Markdown к VK-тексту
 *    не применяем: там «#новости» в начале строки стал бы заголовком, а ссылки
 *    и эмодзи VK приходят уже в своём виде.
 */
export function NewsBody({ item, className }: { item: NewsItem; className?: string }) {
  const text = String(item.content || item.excerpt || "").trim();

  if (!text) {
    return (
      <p className={cn(NEWS_BODY_CLASS, "text-muted-foreground italic", className)}>
        Текст этой заметки — в группе ВКонтакте, кнопка ниже.
      </p>
    );
  }

  if (isVkNews(item)) {
    return (
      <div className={cn(NEWS_BODY_CLASS, className)} style={{ whiteSpace: "pre-line" }}>
        {text}
      </div>
    );
  }

  return (
    <div
      className={cn(NEWS_BODY_CLASS, className)}
      // mdToHtml экранирует весь ввод и добавляет только свои теги (lib/markdown.ts)
      dangerouslySetInnerHTML={{ __html: mdToHtml(text) }}
    />
  );
}

/** Отметка «написано на сайте» / «из VK» — чтобы лента не выглядела Однородной. */
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
