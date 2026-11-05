"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal } from "./Reveal";

const PLACEHOLDER = /^(имя преподавателя|имя специалиста|ф и\.?\s*о\.?|и\.?\s*о\.?|преподаватель|педагог|специалист)$/i;
export function isRealTeacher(t: { name?: string; role?: string }) {
  const name = (t.name || "").trim();
  return name.length >= 2 && !PLACEHOLDER.test(name);
}

export function Teachers() {
  const content = useContent();
  const teachers = (content.teachers || []).filter(isRealTeacher);

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
  }, [updateEdges, teachers.length]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-specialist-card]");
    const gap = parseFloat(getComputedStyle(el).columnGap || "16") || 16;
    const step = card ? (card.clientWidth + gap) * 2 : el.clientWidth * 0.75;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (teachers.length === 0) return null;

  return (
    <section id="teachers" className="section-padding relative overflow-hidden">
      <div className="container-max relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-1.5 sm:mb-2">
              Специалисты
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
              Люди, которые помогают детям расти
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Специалисты «Сферы» — это внимание, терпение и искренний интерес к каждому ребёнку.
            </p>
          </Reveal>
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-end">
            {edges.scrollable && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollByCards(-1)}
                  disabled={edges.start}
                  aria-label="Предыдущие специалисты"
                  className="w-9 h-9 rounded-full border border-border/80 bg-card text-foreground flex items-center justify-center shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCards(1)}
                  disabled={edges.end}
                  aria-label="Следующие специалисты"
                  className="w-9 h-9 rounded-full border border-border/80 bg-card text-foreground flex items-center justify-center shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <Link
              href="/specialists"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 group py-1.5 px-3 rounded-lg hover:bg-primary/5"
            >
              <span>Все специалисты</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Компактная карусель в одну строку */}
        <Reveal delay={0.1}>
          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            role="region"
            aria-label="Карусель специалистов"
            tabIndex={0}
            className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide overscroll-x-contain focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                data-specialist-card
                className="w-[190px] sm:w-[210px] md:w-[230px] shrink-0 snap-start"
              >
                <div className="card-hover glass rounded-2xl overflow-hidden h-full flex flex-col group border border-border/60">
                  <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                    {teacher.photo ? (
                      <Image
                        src={teacher.photo}
                        alt={teacher.name}
                        fill
                        sizes="(max-width: 640px) 190px, 230px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-warm/10">
                        <GraduationCap className="w-12 h-12 text-brand-warm-ink/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-sm text-foreground leading-snug">
                      {teacher.name}
                    </h3>
                    {teacher.role && (
                      <p className="text-xs font-medium text-brand-warm-ink mt-0.5">
                        {teacher.role}
                      </p>
                    )}
                    {teacher.bio && (
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                        {teacher.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}