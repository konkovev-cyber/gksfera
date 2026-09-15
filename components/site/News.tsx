"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { useContent } from "./ContentContext";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { newsKey, newsUrl } from "@/lib/news";
import { NewsSourceBadge } from "./NewsArticle";

const MONTHS_RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
// Детерминированный формат: берём дату прямо из ISO-строки (без new Date/tz),
// чтобы сервер и клиент рендерили одинаково (нет hydration-несоответствия) и
// не печатали «Invalid Date» на пустом/битом значении.
function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return "";
  const mo = Number(m[2]), d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  return `${d} ${MONTHS_RU[mo - 1]} ${m[1]}`;
}

export function News() {
  const { news } = useContent();

  // Карусель: 4 карточки в ряд на десктопе, остальные — прокруткой.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false, scrollable: false });
  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft >= max - 4;
    const scrollable = max > 8;
    setEdges((prev) =>
      prev.start === start && prev.end === end && prev.scrollable === scrollable
        ? prev
        : { start, end, scrollable }
    );
  }, []);
  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateEdges());
      ro.observe(el);
    } else {
      window.addEventListener("resize", updateEdges);
    }
    return () => {
      ro ? ro.disconnect() : window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, news?.length]);
  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-news-card]");
    const gap = parseFloat(getComputedStyle(el).columnGap || "20") || 20;
    const step = card ? card.clientWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (!news || news.length === 0) return null;

  return (
    <section id="news" className="section-padding relative overflow-hidden">
      <div className="container-max">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2">
              Новости
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground">
              Что нового в «Сфере»
            </h2>
          </div>
        </Reveal>

        <div className="relative">
          {/* Стрелки прокрутки по бокам ленты (только когда есть что листать) */}
          {edges.scrollable && (
            <>
              <button
                onClick={() => scrollByCards(-1)}
                disabled={edges.start}
                aria-label="Предыдущие новости"
                className="hidden md:flex absolute left-1 lg:-left-4 top-[42%] -translate-y-1/2 z-10 w-11 h-11 rounded-full border-2 border-border bg-card text-foreground items-center justify-center shadow-lg transition-all hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollByCards(1)}
                disabled={edges.end}
                aria-label="Следующие новости"
                className="hidden md:flex absolute right-1 lg:-right-4 top-[42%] -translate-y-1/2 z-10 w-11 h-11 rounded-full border-2 border-border bg-card text-foreground items-center justify-center shadow-lg transition-all hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Лента карточек: 4 в ряд + горизонтальная прокрутка */}
          <Reveal delay={0.1}>
            <div
              ref={scrollerRef}
              onScroll={updateEdges}
              role="group"
              aria-label="Лента новостей, прокручивается"
              tabIndex={0}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide overscroll-x-contain focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-xl"
            >
              {news.map((item, i) => (
                <div
                  data-news-card
                  key={newsKey(item) || `n-${i}`}
                  className="shrink-0 snap-start w-[82%] min-[420px]:w-[58%] sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
                >
                  <Link
                    href={newsUrl(item)}
                    className="group block glass rounded-2xl overflow-hidden hover:shadow-lg transition-shadow h-full"
                  >
                    {item.image_url && (
                      <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <NewsSourceBadge item={item} className="absolute left-3 top-3" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <time dateTime={item.published_at.slice(0, 10)}>{formatDate(item.published_at)}</time>
                      </div>
                      <h3 className="font-display font-bold text-foreground text-sm leading-snug mb-2 group-hover:text-brand-warm-ink transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-warm-ink opacity-0 group-hover:opacity-100 transition-opacity">
                        Читать полностью <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Подсказка «листайте» на мобильных */}
        {edges.scrollable && (
          <p className="md:hidden mt-1 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" />
            листайте — всего {news.length}
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        )}

        {news.length > 4 && (
          <Reveal>
            <div className="text-center mt-6">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-warm hover:text-brand-warm-ink transition-colors"
              >
                Все новости <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
