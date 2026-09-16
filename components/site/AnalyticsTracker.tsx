"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, eventForHref, type TrackName } from "@/lib/analytics";

/**
 * Единая точка аналитики: ставится один раз в root layout и снимает необходимость
 * размечать каждую кнопку. Логика такая:
 *  • клик по элементу с data-track="..." → событие с этим именем (свойства
 *    data-track-* подмешиваются);
 *  • иначе клик по ссылке → имя выводится из href (eventForHref): tel: →
 *    click_phone, max.ru → click_max и т.д.;
 *  • смена маршрута → page_view (в force-dynamic страницах это и есть просмотр).
 * Слушатель навешивается на document через closest(): элементы могут появляться
 * и исчезать (лайтбокс, меню), а завязываться на конкретный узел — значит
 * терять события после ре-рендера.
 */
/**
 * Раздел, из которого пришёл клик. Отдельной строкой, а не инлайном: в прошлом
 * здесь был приоритет `a ?? b ? c : d`, и из-за него любое событие внутри
 * section[id] помечалось как "footer" — имя события верное, а разметка в
 * выгрузке ломалась.
 */
function sectionOf(el: Element): string {
  const sec = el.closest("section[id]");
  if (sec && sec.id) return sec.id;
  if (el.closest("footer")) return "footer";
  if (el.closest("header")) return "header";
  return "page";
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("sftrack") === "1") (window as Window & { __sferaTrackDebug?: boolean }).__sferaTrackDebug = true;
      else if (localStorage.getItem("sfera_track") === "1")
        (window as Window & { __sferaTrackDebug?: boolean }).__sferaTrackDebug = true;
    } catch {
      /* приватный режим без localStorage — просто без отладочного вывода */
    }
  }, []);

  useEffect(() => {
    // Первый прогон совпадает с серверным рендером: второй page_view не нужен.
    if (first.current) {
      first.current = false;
      return;
    }
    trackEvent("page_view", { path: pathname });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-track], a[href], button");
      if (!el) return;

      const explicit = el.getAttribute("data-track");
      if (explicit) {
        const props: Record<string, string> = {};
        for (const attr of Array.from(el.attributes)) {
          if (attr.name.startsWith("data-track-")) {
            props[attr.name.slice("data-track-".length).replace(/-/g, "_")] = attr.value;
          }
        }
        // Раздел, из которого кликнули, полезен в выгрузке не меньше имени.
        props.section = sectionOf(el);
        trackEvent(explicit as TrackName, props);
        return;
      }

      const href = el.getAttribute("href");
      if (!href) return;
      const name = eventForHref(href);
      if (name) {
        trackEvent(name, {
          section: sectionOf(el),
          // Длина, а не значение: для tel:/vk/... достаточно знать, что это за цель.
          href_len: href.length,
        });
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
