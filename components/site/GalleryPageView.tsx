"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Play, Images, Video } from "lucide-react";
import { Reveal } from "./Reveal";
import { GalleryLightbox } from "./GalleryLightbox";
import { cn } from "@/lib/utils";
import { isVideoSrc } from "@/lib/compress";
import type { GalleryItem } from "@/data/site";

type Filter = "all" | "photo" | "video";

/**
 * Плитка мозаики. Размер берётся из item.span: «tall» — на три строки,
 * «wide» — два столбца, обычный — две строки (портрет 4:5).
 */
function MosaicTile({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  const video = isVideoSrc(item.src);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        item.span === "tall" && "row-span-3",
        item.span === "wide" && "col-span-2 row-span-2",
        (!item.span || item.span === "normal") && "row-span-2"
      )}
      aria-label={`${video ? "Открыть видео" : "Открыть фото"}: ${item.alt}`}
    >
      {video ? (
        <video
          src={item.src}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={item.pos ? { objectPosition: item.pos } : undefined}
        />
      ) : (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={item.pos ? { objectPosition: item.pos } : undefined}
        />
      )}

      {/* Подпись выезжает снизу при наведении/фокусе */}
      <span className="absolute inset-x-0 bottom-0 flex items-end pt-10 pb-3 px-3 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
        <span className="text-xs sm:text-sm font-medium text-background leading-snug line-clamp-2">
          {item.alt}
        </span>
      </span>

      {video && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/70 group-hover:bg-black/70 group-hover:scale-110 transition-all">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </span>
        </span>
      )}
    </button>
  );
}

/**
 * Содержимое страницы /gallery: фильтр по типу + мозаичная сетка + полноэкранный
 * просмотр. Сами шапка и хлебные крошки рендерятся на сервере в page.tsx.
 */
export function GalleryPageView({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [index, setIndex] = useState<number | null>(null);

  const videos = useMemo(() => items.filter((i) => isVideoSrc(i.src)), [items]);
  const photos = useMemo(() => items.filter((i) => !isVideoSrc(i.src)), [items]);

  const list = useMemo(() => {
    if (filter === "photo") return photos;
    if (filter === "video") return videos;
    return items;
  }, [filter, items, photos, videos]);

  const chips: { key: Filter; label: string; count: number; icon: typeof Images }[] = [
    { key: "all", label: "Все", count: items.length, icon: Images },
    { key: "photo", label: "Фото", count: photos.length, icon: Images },
    ...(videos.length ? [{ key: "video" as Filter, label: "Видео", count: videos.length, icon: Video }] : []),
  ];

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card p-10 text-center">
        <Images className="w-10 h-10 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="font-display font-bold text-xl text-foreground mb-2">
          Фотографии ещё не загружены
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Мы уже готовим для вас снимки занятий, праздников и спектаклей. Загляните
          позже или напишите нам — пришлём актуальные фото.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-8" role="group" aria-label="Фильтр по типу">
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold border transition-colors",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/50"
              )}
            >
              <c.icon className="w-4 h-4" aria-hidden="true" />
              {c.label}
              <span className={cn("text-xs", active ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                {c.count}
              </span>
            </button>
          );
        })}
        <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">
          нажмите на фото, чтобы открыть просмотр · стрелки и свайп листают
        </span>
      </div>

      {/* Мозаика: плотная раскладка, чтобы «wide»-плитки не оставляли дыр */}
      <Reveal>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[112px] sm:auto-rows-[140px] lg:auto-rows-[168px] [grid-auto-flow:dense]">
          {list.map((item, i) => (
            <MosaicTile key={`${item.src}-${i}`} item={item} onOpen={() => setIndex(i)} />
          ))}
        </div>
      </Reveal>

      {list.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          В этом разделе пока пусто — выберите «Все».
        </p>
      )}

      <GalleryLightbox
        items={list}
        index={index}
        onClose={() => setIndex(null)}
        onIndex={(i) => setIndex(i)}
      />
    </>
  );
}
