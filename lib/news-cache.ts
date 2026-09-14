import { revalidatePath } from "next/cache";

/**
 * Сброс кэша после изменения новостей.
 *
 * Раньше каждый маршрут чистил что-то своё: админка новостей — только "/" и
 * "/news" (текст на странице новости висел устаревшим до истечения ISR),
 * синхронизация VK — вообще только "/" в админском варианте. Соберём правильно
 * в одном месте.
 */
export function revalidateNews(key?: string) {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/news/[id]"); // паттерн динамического маршрута
  if (key) revalidatePath(`/news/${key}`);
  // sitemap.ts живёт со своим revalidate = 3600: без этого пункта новая новость
  // попадала в карту сайта только через час, а удалённая висела в ней ещё дольше.
  revalidatePath("/sitemap.xml");
}

/** Полные счётчики синхронизации — админке важно видеть не только «новых N». */
export function syncPayload(r: {
  imported?: number;
  updated?: number;
  skipped?: number;
  mirrored?: number;
  reused?: number;
  total?: number;
}) {
  return {
    ok: true,
    imported: r.imported ?? 0,
    updated: r.updated ?? 0,
    skipped: r.skipped ?? 0,
    mirrored: r.mirrored ?? 0,
    reused: r.reused ?? 0,
    total: r.total ?? 0,
  };
}
