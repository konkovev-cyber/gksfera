"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "./ContentContext";

import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function Gallery() {
  const content = useContent();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + content.gallery.length) % content.gallery.length
    );
  }, []);
  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % content.gallery.length
    );
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  // Masonry grid classes based on span type
  const spanClass = (span?: string) => {
    if (span === "tall") return "row-span-2";
    if (span === "wide") return "col-span-2";
    return "";
  };

  return (
    <section id="gallery" className="section-padding bg-brand-cream/50 relative overflow-hidden">
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
            Галерея
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
            Жизнь «Сферы» в фотографиях
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Занятия, творчество, праздники и спектакли — загляните внутрь студии.
          </p>
        </Reveal>

        {/* Masonry grid на десктопе */}
        <Reveal delay={0.1}>
          <div className="mt-10 hidden md:grid grid-cols-4 auto-rows-[200px] gap-4">
            {content.gallery.map((item, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className={cn(
                  "relative rounded-2xl overflow-hidden group cursor-pointer",
                  spanClass(item.span)
                )}
                aria-label={`Открыть фото: ${item.alt}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  style={item.pos ? { objectPosition: item.pos } : undefined}
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
              </button>
            ))}
          </div>
        </Reveal>

        {/* Мобильная горизонтальная прокрутка */}
        <Reveal delay={0.1}>
          <div className="mt-8 md:hidden flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {content.gallery.map((item, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="relative flex-shrink-0 w-[260px] h-[200px] rounded-2xl overflow-hidden snap-start"
                aria-label={`Открыть фото: ${item.alt}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="260px"
                  className="object-cover"
                  style={item.pos ? { objectPosition: item.pos } : undefined}
                />
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-foreground/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/30 transition-colors"
              onClick={closeLightbox}
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/30 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl w-full h-[70vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={content.gallery[lightboxIndex].src}
                alt={content.gallery[lightboxIndex].alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            <button
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/30 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Следующее фото"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {content.gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
