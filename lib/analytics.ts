/**
 * Аналитика событий. Намеренно без сторонних скриптов: счётчик (Я.Метрика /
 * GTM / что угодно) ещё не выбран, а места для событий должны быть размечены
 * сейчас, пока они не расползлись по компонентам магическими строками.
 *
 * Как это работает без счётчика:
 *  • событие кладётся в window.dataLayer — его подхватит GTM, если его поставят;
 *  • дублируется в window.__sferaEvents (буфер на 50 штук), чтобы скрипт
 *    счётчика, загрузившийся позже, мог доиграть то, что случилось до него;
 *  • если в мире есть Яндекс.Метрика и ей сказали id (window.__SFERA_YM_ID),
 *    шлётся ещё и reachGoal — так цели видны прямо в интерфейсе Метрики;
 *  • локально можно смотреть события, добавив ?sftrack=1 (или
 *    localStorage.sfera_track='1') — без этого в консоль не пишется ничего,
 *    чтобы production-консоль оставалась чистой.
 *
 * Никаких PII в свойствах событий: только имя события, канал, раздел и длина
 * строки — но не сами имена, телефоны и комментарии.
 */

export type TrackName =
  | "page_view"
  | "view_direction"
  | "click_direction"
  | "click_phone"
  | "click_vk"
  | "click_max"
  | "click_map"
  | "click_cta"
  | "menu_open"
  | "theme_toggle"
  | "form_start"
  | "form_submit"
  | "form_success"
  | "form_error"
  | "faq_open"
  | "gallery_open";

export type TrackProps = Record<string, string | number | boolean | undefined>;

type Win = Window & {
  dataLayer?: Record<string, unknown>[];
  ym?: (...args: unknown[]) => void;
  __SFERA_YM_ID?: number;
  __sferaEvents?: { name: string; props: TrackProps; ts: number }[];
  __sferaTrackDebug?: boolean;
};

const BUFFER = 50;

export function trackEvent(name: TrackName, props: TrackProps = {}): void {
  if (typeof window === "undefined") return; // серверный рендер — тишина
  const w = window as Win;
  const at = Date.now();

  (w.dataLayer = w.dataLayer || []).push({ event: name, ...props });
  w.__sferaEvents = w.__sferaEvents || [];
  w.__sferaEvents.push({ name, props, ts: at });
  if (w.__sferaEvents.length > BUFFER) w.__sferaEvents.splice(0, w.__sferaEvents.length - BUFFER);

  // Метрика: цели по id счётчика. id сообщает тот, кто ставит счётчик.
  if (typeof w.ym === "function" && w.__SFERA_YM_ID) {
    try {
      w.ym(w.__SFERA_YM_ID, "reachGoal", name, props);
    } catch {
      /* счётчик ещё не готов — данные всё равно лежат в dataLayer и буфере */
    }
  }

  if (w.__sferaTrackDebug) {
    // Только по явному включению (?sftrack=1): в обычной сессии консоль чистая.
    console.info("[track]", name, props);
  }
}

/**
 * Каноническое имя события по ссылке. Нужен один источник, чтобы метка
 * «звонок это click_phone или click_cta» не решалась в десяти компонентах по
 * своему — иначе выгрузка событий превращается в кашу из синонимов.
 */
export function eventForHref(href: string): TrackName | null {
  const h = (href || "").trim().toLowerCase();
  if (!h) return null;
  if (h.startsWith("tel:") || h.startsWith("viber:") || h.startsWith("sms:")) return "click_phone";
  if (h.includes("max.ru") || h.includes("messenger.max")) return "click_max";
  if (h.includes("vk.com") || h.includes("vk.ru") || h.includes("vk.me")) return "click_vk";
  if (h.includes("yandex.ru/maps") || h.includes("yandex.com/maps") || h.includes("google.com/maps") || h.includes("maps.google"))
    return "click_map";
  if (/\/programs\/[^/]+/.test(h) && !/\/programs\/?$/.test(h)) return "click_direction";
  if (h.includes("#enrollment") || h.includes("/#tasks")) return "click_cta";
  return null;
}
