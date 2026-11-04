"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Calendar,
  ExternalLink,
  MessageCircle,
  Share2,
  Play,
  Images,
} from "lucide-react";
import { parseNewsMedia } from "@/lib/news";
import { NewsBody, NewsSourceBadge } from "./NewsArticle";
import { GalleryLightbox } from "./GalleryLightbox";
import { SharePopup } from "./SharePopup";
import type { NewsItem, GalleryItem } from "@/data/site";
import { cn } from "@/lib/utils";

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function NewsDetailClient({
  news,
  maxUrl,
  shareUrl,
}: {
  news: NewsItem;
  maxUrl?: string;
  shareUrl: string;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { photos, videos } = parseNewsMedia(news);

  // Формируем элементы для GalleryLightbox
  const galleryItems: GalleryItem[] = photos.map((src, i) => ({
    src,
    alt: `${news.title} — фото ${i + 1}`,
  }));

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-muted-foreground mb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={news.published_at.slice(0, 10)}>
              {fmtDate(news.published_at)}
            </time>
          </span>
          <NewsSourceBadge item={news} />
        </div>

        {/* Кнопка Поделиться вверху */}
        <div className="relative">
          <button
            onClick={() => setShareOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/70 hover:border-primary/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Поделиться новостью"
            aria-expanded={shareOpen}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Поделиться</span>
          </button>

          <AnimatePresence>
            {shareOpen && (
              <SharePopup
                url={shareUrl}
                title={news.title}
                onClose={() => setShareOpen(false)}
                className="absolute right-0 top-9"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground text-balance leading-tight">
        {news.title}
      </h1>

      {/* Главное фото / обложка */}
      {photos.length > 0 && (
        <div
          onClick={() => openLightboxAt(0)}
          className="mt-8 group relative w-full rounded-2xl border border-border/60 overflow-hidden bg-brand-cream/50 max-h-[600px] cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openLightboxAt(0);
          }}
          aria-label="Открыть фото на весь экран"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[0]}
            alt={news.title}
            className="w-full h-full object-contain group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
            <Images className="w-3.5 h-3.5" />
            {photos.length > 1 ? `1 из ${photos.length}` : "Увеличить"}
          </div>
        </div>
      )}

      {/* Текст новости */}
      <NewsBody item={news} className="mt-8" />

      {/* Галерея дополнительных фотографий (если фото > 1) */}
      {photos.length > 1 && (
        <section className="mt-10 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Images className="w-5 h-5 text-brand-warm-ink" />
              Фотоальбом к новости
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              Всего {photos.length} фото
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((src, idx) => (
              <div
                key={src}
                onClick={() => openLightboxAt(idx)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-border/70 bg-brand-cream/40 cursor-pointer hover:border-primary transition-all hover:shadow-md"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openLightboxAt(idx);
                }}
                aria-label={`Открыть фото ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Фото ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                <span className="absolute bottom-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Видеозаписи из VK */}
      {videos.length > 0 && (
        <section className="mt-10 pt-6 border-t border-border/50">
          <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Видеозаписи
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {videos.map((vid, idx) => (
              <a
                key={vid.url || idx}
                href={vid.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden border border-border/70 bg-card hover:border-primary hover:shadow-md transition-all"
              >
                <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {vid.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vid.image}
                      alt={vid.title || "Видеозапись"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-muted-foreground/40">Видеозапись</div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {vid.title || "Смотреть видеозапись ВКонтакте"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    Открыть в VK <ExternalLink className="w-3 h-3" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Кнопки действий под статьей */}
      <div className="mt-10 pt-6 border-t border-border/50 flex flex-wrap items-center gap-3">
        {news.source_url && (
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-warm hover:text-brand-warm-ink transition-colors"
          >
            Обсудить в VK <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={() => setShareOpen((o) => !o)}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
        >
          Поделиться <Share2 className="w-4 h-4" />
        </button>

        {maxUrl && (
          <a
            href={maxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-teal hover:text-brand-teal-ink transition-colors"
          >
            Задать вопрос в MAX <MessageCircle className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Лайтбокс фото */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={galleryItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndex={(i) => setLightboxIndex(i)}
        />
      )}
    </>
  );
}
