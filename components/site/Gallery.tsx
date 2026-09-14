"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play, Images } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "./ContentContext";

import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";
import { isVideoSrc } from "@/lib/compress";
import type { GalleryItem } from "@/data/site";

// Плитка карусели — на уровне модуля, чтобы не пересоздаваться при каждом
// ре-рендере Gallery (иначе <Image>/<video> перемонтировались бы при скролле).
function Tile({
  item,
  i,
  onOpen,
}: {
  item: GalleryItem;
  i: number;
  onOpen: (i: number) => void;
}) {
  const video = isVideoSrc(item.src);
  return (
    <button
      data-card
      onClick={() => onOpen(i)}
      className={cn(
        "group relative shrink-0 snap-start aspect-[4/5] w-[74%] min-[420px]:w-[52%] sm:w-[46%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] rounded-2xl overflow-hidden bg-muted cursor-pointer",
      )}
      aria-label={`${video ? "Открыть видео" : "Открыть фото"}: ${item.alt}`}
    >
      {video ? (
        <video
          src={item.src}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          style={item.pos ? { objectPosition: item.pos } : undefined}
        />
      ) : (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 74vw, (max-width: 768px) 46vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          style={item.pos ? { objectPosition: item.pos } : undefined}
        />
      )}
      {video && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/70 group-hover:bg-black/70 group-hover:scale-110 transition-all">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
        {!video && (
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
        )}
      </div>
    </button>
  );
}

export function Gallery() {
  const content = useContent();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setZoomed(false);
  }, []);
  const goPrev = useCallback(() => {
    setZoomed(false);
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + content.gallery.length) % content.gallery.length
    );
  }, [content.gallery.length]);
  const goNext = useCallback(() => {
    setZoomed(false);
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % content.gallery.length
    );
  }, [content.gallery.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      // Пробел/Enter переключают зум, но только когда фокус НЕ на интерактивном
      // элементе — иначе они глушат активацию собственных кнопок overlay.
      const t = e.target as HTMLElement | null;
      if (t && t.closest("button, a, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setZoomed((z) => !z); }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  // Если набор изменился (админ удалил фото при открытом окне) — закрываем,
  // иначе индекс уходит за границы, а блокировка прокрутки повиснет.
  useEffect(() => {
    if (lightboxIndex !== null && !content.gallery[lightboxIndex]) {
      setLightboxIndex(null);
      setZoomed(false);
    }
  }, [lightboxIndex, content.gallery]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || zoomed) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = e.changedTouches[0].clientY - touchRef.current.startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext(); else goPrev();
    }
    touchRef.current = null;
  };

  // Горизонтальная карусель: видно 4 плитки, остальные — прокруткой.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false, scrollable: false });
  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft >= max - 4;
    const scrollable = max > 8;
    // Возвращаем prev без изменений, если флаги совпали → не плодим ре-рендер
    // на каждом событии scroll (иначе лента перерисовывалась бы при прокрутке).
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
    // resize не эмитится обычным <div>, поэтому за размером ленты следим
    // ResizeObserver'ом — иначе стрелки/состояние «до края» устаревали бы
    // после поворота экрана/изменения ширины, пока пользователь не проскроллит.
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
  }, [updateEdges, content.gallery.length]);
  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const gap = parseFloat(getComputedStyle(el).columnGap || "16") || 16;
    const step = card ? card.clientWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="gallery" className="section-padding bg-brand-cream/50 relative overflow-hidden">
      <div className="container-max relative z-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
                Галерея
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
                Жизнь «Сферы» в фотографиях
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Занятия, творчество, праздники и спектакли — загляните внутрь студии.
              </p>
            </div>
            {/* Стрелки прокрутки (только когда есть что листать) */}
            {edges.scrollable && (
              <div className="hidden sm:flex items-center gap-2 pb-1 shrink-0">
                <button
                  onClick={() => scrollByCards(-1)}
                  disabled={edges.start}
                  aria-label="Предыдущие фото"
                  className="w-11 h-11 rounded-full border-2 border-border bg-card text-foreground flex items-center justify-center transition-all hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollByCards(1)}
                  disabled={edges.end}
                  aria-label="Следующие фото"
                  className="w-11 h-11 rounded-full border-2 border-border bg-card text-foreground flex items-center justify-center transition-all hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* Карусель: 4 плитки в ряд + горизонтальная прокрутка */}
        <Reveal delay={0.1}>
          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            role="group"
            aria-label="Галерея, прокручивается"
            tabIndex={0}
            className="mt-8 sm:mt-10 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 scrollbar-hide overscroll-x-contain focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-xl"
          >
            {content.gallery.map((item, i) => (
              <Tile key={`${item.src}-${i}`} item={item} i={i} onOpen={(idx) => setLightboxIndex(idx)} />
            ))}
          </div>
        </Reveal>

        {/* Подсказка «листайте» на мобильных */}
        {edges.scrollable && (
          <p className="sm:hidden mt-1 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" />
            листайте — всего {content.gallery.length}
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        )}

        {/* Все фото — открывает полноэкранный просмотр всего набора */}
        {content.gallery.length > 4 && (
          <Reveal>
            <div className="text-center mt-6">
              <button
                onClick={() => setLightboxIndex(0)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-warm hover:text-brand-warm transition-colors"
              >
                <Images className="w-4 h-4" />
                Смотреть все фото
                <span className="text-muted-foreground font-normal">({content.gallery.length})</span>
              </button>
            </div>
          </Reveal>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && content.gallery[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-foreground/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Кнопка закрытия */}
            <button
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/30 transition-colors z-20"
              onClick={closeLightbox}
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Кнопка зума (только для изображений) */}
            {!isVideoSrc(content.gallery[lightboxIndex].src) && (
              <button
                className="absolute top-4 right-20 w-12 h-12 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/30 transition-colors z-20"
                onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
                aria-label={zoomed ? "Уменьшить" : "Увеличить"}
              >
                {zoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
              </button>
            )}

            {/* Стрелки навигации */}
            {!zoomed && (
              <>
                <button
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/30 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/30 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Фото / видео */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative w-full transition-transform duration-300",
                isVideoSrc(content.gallery[lightboxIndex].src)
                  ? "max-w-4xl h-[70vh] flex items-center justify-center"
                  : cn("cursor-pointer", zoomed ? "h-[90vh] overflow-auto" : "max-w-4xl h-[70vh]"),
              )}
              onClick={
                isVideoSrc(content.gallery[lightboxIndex].src)
                  ? (e) => e.stopPropagation()
                  : (e) => { e.stopPropagation(); setZoomed((z) => !z); }
              }
            >
              {isVideoSrc(content.gallery[lightboxIndex].src) ? (
                <video
                  src={content.gallery[lightboxIndex].src}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full max-h-[70vh] object-contain rounded-xl bg-black"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.gallery[lightboxIndex].src}
                  alt={content.gallery[lightboxIndex].alt}
                  className={cn(
                    "w-full h-full transition-transform duration-300",
                    zoomed ? "object-contain scale-150 origin-center" : "object-contain"
                  )}
                  draggable={false}
                />
              )}
            </motion.div>

            {/* Счётчик */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm flex items-center gap-3">
              <span>{lightboxIndex + 1} / {content.gallery.length}</span>
              <span className="text-white/40 text-xs hidden sm:inline">
                {zoomed ? "кликните для уменьшения" : "кликните для увеличения · стрелки для навигации"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
