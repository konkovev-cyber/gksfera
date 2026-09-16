import { Loader2 } from "lucide-react";

/**
 * Скелетон на время серверных запросов к Supabase.
 *
 * Страницы сайта почти все динамические (force-dynamic + getContent()), и без
 * loading.tsx переход на /news или /programs показывал белый экран, пока идёт
 * запрос. Теперь пользователь сразу видит фирменный индикатор.
 *
 * Стили — только существующие токены (brand-*, muted-foreground), без новых
 * CSS-классов: файл глобальный и подхватывается всеми сегментами без своего
 * loading.tsx.
 */
export default function Loading() {
  return (
    <div
      className="min-h-[60vh] grid place-items-center px-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-brand-warm" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Загружаем…</p>
      </div>
    </div>
  );
}