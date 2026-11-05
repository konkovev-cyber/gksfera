"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ArrowRight, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal } from "./Reveal";
import { isRealTeacher } from "@/lib/teachers";
import { SpecialistModal } from "./SpecialistModal";

export { isRealTeacher };

export function Teachers() {
  const content = useContent();
  const teachers = (content.teachers || []).filter(isRealTeacher);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false, scrollable: true });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedTeacherIndex, setSelectedTeacherIndex] = useState<number | null>(null);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const scrollable = max > 8;
    const start = el.scrollLeft <= 6;
    const end = !scrollable || el.scrollLeft >= max - 6;
    const progress = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0;
    setScrollProgress(progress);
    setEdges({ start, end, scrollable });
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
    const step = card ? (card.clientWidth + gap) * 2.2 : el.clientWidth * 0.7;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft >= max - 2;
    if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
      el.scrollLeft += e.deltaY;
      updateEdges();
    }
  };

  if (teachers.length === 0) return null;

  return (
    <section id="teachers" className="section-padding relative overflow-hidden">
      <div className="container-max relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-1.5 sm:mb-2">
              Специалисты
            </p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground text-balance leading-[1.15]">
              Люди, которые помогают детям расти
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Педагоги и наставники «Сферы» — терпение, опыт и внимание к каждому ребёнку. Нажмите на карточку, чтобы узнать больше.
            </p>
          </Reveal>
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-end">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                disabled={edges.start}
                aria-label="Предыдущие специалисты"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border/80 bg-card text-foreground flex items-center justify-center shadow-sm transition-all hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                disabled={edges.end}
                aria-label="Следующие специалисты"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border/80 bg-card text-foreground flex items-center justify-center shadow-sm transition-all hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link
              href="/specialists"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 group py-1.5 px-2.5 rounded-lg hover:bg-primary/5"
            >
              <span>Все специалисты</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Карусель с боковыми стрелками на десктопе */}
        <Reveal delay={0.1}>
          <div className="relative group/carousel">
            {/* Боковая стрелка влево */}
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={edges.start}
              aria-label="Листать назад"
              className="hidden md:flex absolute -left-4 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/95 hover:bg-card border border-border/90 shadow-lg items-center justify-center text-foreground hover:text-primary transition-all disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Боковая стрелка вправо */}
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={edges.end}
              aria-label="Листать вперед"
              className="hidden md:flex absolute -right-4 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/95 hover:bg-card border border-border/90 shadow-lg items-center justify-center text-foreground hover:text-primary transition-all disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={scrollerRef}
              onScroll={updateEdges}
              onWheel={handleWheel}
              role="region"
              aria-label="Карусель специалистов"
              tabIndex={0}
              className="flex gap-3.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 overscroll-x-contain focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.25)_transparent]"
            >
              {teachers.map((teacher, index) => (
                <div
                  key={teacher.id}
                  data-specialist-card
                  className="w-[155px] sm:w-[170px] md:w-[185px] shrink-0 snap-start"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherIndex(index)}
                    aria-label={`Открыть данные специалиста: ${teacher.name}`}
                    className="w-full text-left card-hover glass rounded-2xl overflow-hidden h-full flex flex-col group border border-border/60 hover:border-primary/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {/* object-top предотвращает срезание головы/макушки у портретов */}
                    <div className="relative aspect-[4/4.3] bg-muted overflow-hidden">
                      {teacher.photo ? (
                        <Image
                          src={teacher.photo}
                          alt={teacher.name}
                          fill
                          sizes="(max-width: 640px) 155px, 185px"
                          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-warm/10">
                          <GraduationCap className="w-10 h-10 text-brand-warm-ink/30" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <ArrowUpRight className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-xs sm:text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {teacher.name}
                        </h3>
                        {teacher.role && (
                          <p className="text-[11px] sm:text-xs font-medium text-brand-warm-ink mt-0.5 line-clamp-2">
                            {teacher.role}
                          </p>
                        )}
                        {teacher.bio && (
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {teacher.bio}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between text-[10px] font-semibold text-primary">
                        <span>Подробнее</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Аккуратный индикатор прогресса прокрутки снизу */}
            <div className="mt-2 w-full max-w-[200px] mx-auto h-1 bg-border/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full transition-[width,transform] duration-150"
                style={{
                  width: `${Math.max(15, (scrollerRef.current ? (scrollerRef.current.clientWidth / scrollerRef.current.scrollWidth) : 0.25) * 100)}%`,
                  transform: `translateX(${scrollProgress * 250}%)`,
                }}
              />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Модальное окно специалиста */}
      <SpecialistModal
        specialists={teachers}
        currentIndex={selectedTeacherIndex}
        onClose={() => setSelectedTeacherIndex(null)}
        onNavigate={(newIdx) => setSelectedTeacherIndex(newIdx)}
      />
    </section>
  );
}
