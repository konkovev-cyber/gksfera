"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { isVideoSrc } from "@/lib/compress";
import type { GalleryItem } from "@/data/site";

/**
 * Полноэкранный просмотр фото/видео. Общий для карусели на главной и для
 * страницы /gallery, чтобы поведение (клавиши, свайпы, зум, блокировка
 * прокрутки) не различалось.
 *
 * Компонент рендерит fixed-оверлей, поэтому в JSX его ставьте прямым ребёнком
 * секции — внутри framer-motion-обёрток (Reveal) fixed превращается в relative.
 */
export function GalleryLightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  const open = index !== null && !!items[index];
  const total = items.length;

  const close = useCallback(() => {
    setZoomed(false);
    onClose();
  }, [onClose]);

  const goPrev = useCallback(() => {
    setZoomed(false);
    if (index === null || total === 0) return;
    onIndex((index - 1 + total) % total);
  }, [index, total, onIndex]);

  const goNext = useCallback(() => {
    setZoomed(false);
    if (index === null || total === 0) return;
    onIndex((index + 1) % total);
  }, [index, total, onIndex]);

  // Смена кадра — зум сбрасываем, иначе следующий файл откроется увеличенным.
  useEffect(() => {
    setZoomed(false);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      // Пробел/Enter переключают зум, но только когда фокус НЕ на интерактивном
      // элементе — иначе они глушат активацию собственных кнопок overlay.
      const t = e.target as HTMLElement | null;
      if (t && t.closest("button, a, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setZoomed((z) => !z);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, goPrev, goNext]);

  // Если набор изменился (админ удалил фото при открытом окне) — закрываем,
  // иначе индекс уходит за границы, а блокировка прокрутки повиснет.
  useEffect(() => {
    if (index !== null && !items[index]) close();
  }, [index, items, close]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || zoomed) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = e.changedTouches[0].clientY - touchRef.current.startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchRef.current = null;
  };

  const current = open ? items[index] : null;
  const video = current ? isVideoSrc(current.src) : false;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-scrim/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
        >
          {/* Кнопка закрытия */}
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-20"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Кнопка зума (только для изображений) */}
          {!video && (
            <button
              className="absolute top-4 right-20 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-20"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              aria-label={zoomed ? "Уменьшить" : "Увеличить"}
            >
              {zoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
            </button>
          )}

          {/* Стрелки навигации */}
          {!zoomed && total > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Фото / видео */}
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative w-full transition-transform duration-300",
              video
                ? "max-w-4xl h-[70vh] flex items-center justify-center"
                : cn("cursor-pointer", zoomed ? "h-[90vh] overflow-auto" : "max-w-4xl h-[70vh]")
            )}
            onClick={
              video
                ? (e) => e.stopPropagation()
                : (e) => {
                    e.stopPropagation();
                    setZoomed((z) => !z);
                  }
            }
          >
            {video ? (
              <video
                src={current.src}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full max-h-[70vh] object-contain rounded-xl bg-photo-film"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.src}
                alt={current.alt}
                className={cn(
                  "w-full h-full transition-transform duration-300",
                  zoomed ? "object-contain scale-150 origin-center" : "object-contain"
                )}
                draggable={false}
              />
            )}
          </motion.div>

          {/* Подпись + счётчик */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[90vw] text-center">
            <p className="text-on-scrim text-sm mb-1 truncate">{current.alt}</p>
            <div className="text-on-scrim/75 text-sm flex items-center justify-center gap-3">
              <span>
                {(index ?? 0) + 1} / {total}
              </span>
              <span className="text-on-scrim/65 text-xs hidden sm:inline">
                {zoomed
                  ? "кликните для уменьшения"
                  : "кликните для увеличения · стрелки для навигации"}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
