"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Share2, Check, Copy, Link2 } from "lucide-react";
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

/** Кастомный попап «Поделиться» — вместо системного диалога */
function SharePopup({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      label: "ВКонтакте",
      href: `https://vk.com/share.php?url=${encoded}&title=${encodedTitle}`,
      bg: "bg-[#0077FF]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M19.915 13.028c-.388-.49-.277-.708 0-1.146.005-.005 3.851-5.306 4.246-7.107l.002-.007c.194-.65 0-1.128-.947-1.128h-3.135c-.796 0-1.163.414-1.357.874 0 0-1.587 3.782-3.836 6.237-.727.713-1.057.94-1.453.94-.199 0-.487-.227-.487-.877V4.768c0-.783-.232-1.128-.897-1.128H8.708c-.502 0-.803.365-.803.712 0 .75 1.138.924 1.255 3.036v4.588c0 .995-.183 1.175-.579 1.175-1.057 0-3.625-3.802-5.148-8.15C3.143 3.36 2.84 3 2.038 3H-.097C-1 3 -1.2 3.414-1.2 3.874c0 .806 1.057 4.802 4.921 10.088 2.576 3.641 6.203 5.614 9.507 5.614 1.981 0 2.225-.437 2.225-1.19v-2.749c0-.888.19-1.064.832-1.064.472 0 1.28.233 3.169 2.028C21.438 18.378 21.771 19 22.847 19h3.135c.902 0 1.354-.437 1.092-1.302-.285-.862-1.294-2.11-2.636-3.59-.727-.84-1.818-1.742-2.523-2.08z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
      bg: "bg-[#26A5E4]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      bg: "bg-[#25D366]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Скопируйте ссылку:", url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ type: "spring", damping: 24, stiffness: 320 }}
      className="absolute top-16 right-4 z-30 w-64 rounded-2xl overflow-hidden shadow-2xl bg-card border border-border/60 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <span className="text-sm font-semibold text-foreground">Поделиться</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Кнопки соцсетей */}
      <div className="p-3 flex gap-2 justify-around border-b border-border/50">
        {channels.map((ch) => (
          <a
            key={ch.label}
            href={ch.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group"
            aria-label={ch.label}
          >
            <span
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                "transition-transform duration-150 group-hover:scale-110 group-active:scale-95",
                ch.bg
              )}
            >
              {ch.icon}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">{ch.label}</span>
          </a>
        ))}
      </div>

      {/* Поле ссылки + кнопка копировать */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
          <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate flex-1">{url}</span>
          <button
            onClick={handleCopy}
            className={cn(
              "shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all duration-150",
              copied
                ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40"
                : "text-primary hover:bg-accent"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Скопировано
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Копировать
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

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
  const [shareOpen, setShareOpen] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  const open = index !== null && !!items[index];
  const total = items.length;
  const current = open ? items[index] : null;
  const video = current ? isVideoSrc(current.src) : false;

  const close = useCallback(() => {
    setZoomed(false);
    setShareOpen(false);
    onClose();
  }, [onClose]);

  const goPrev = useCallback(() => {
    setZoomed(false);
    setShareOpen(false);
    if (index === null || total === 0) return;
    onIndex((index - 1 + total) % total);
  }, [index, total, onIndex]);

  const goNext = useCallback(() => {
    setZoomed(false);
    setShareOpen(false);
    if (index === null || total === 0) return;
    onIndex((index + 1) % total);
  }, [index, total, onIndex]);

  // Смена кадра — зум и попап сбрасываем
  useEffect(() => {
    setZoomed(false);
    setShareOpen(false);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (shareOpen) { setShareOpen(false); return; }
        close();
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
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
  }, [open, close, goPrev, goNext, shareOpen]);

  // Если набор изменился — закрываем
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

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-scrim/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => {
            if (shareOpen) { setShareOpen(false); return; }
            close();
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
        >
          {/* Кнопка закрытия */}
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-20"
            onClick={(e) => { e.stopPropagation(); close(); }}
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Кнопка зума (только для изображений) */}
          {!video && (
            <button
              className="absolute top-4 right-20 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-20"
              onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
              aria-label={zoomed ? "Уменьшить" : "Увеличить"}
            >
              {zoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
            </button>
          )}

          {/* Кнопка «Поделиться» */}
          <button
            className={cn(
              "absolute top-4 right-36 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-20",
              shareOpen
                ? "bg-primary text-primary-foreground"
                : "bg-on-scrim/10 text-on-scrim hover:bg-on-scrim/20"
            )}
            onClick={(e) => { e.stopPropagation(); setShareOpen((o) => !o); }}
            aria-label="Поделиться"
            aria-expanded={shareOpen}
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Кастомный попап поделиться */}
          <AnimatePresence>
            {shareOpen && (
              <SharePopup
                url={current.src}
                title={current.alt || "Фото студии «Сфера»"}
                onClose={() => setShareOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Стрелки навигации */}
          {!zoomed && total > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-on-scrim/10 text-on-scrim flex items-center justify-center hover:bg-on-scrim/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
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
