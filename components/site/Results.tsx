"use client";

import { CheckCircle2 } from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

export function Results() {
  const content = useContent();
  const results = content.resultsAfterLearning ?? [];
  return (
    <section className="section-padding relative bg-background overflow-hidden">
      <div
        className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-brand-teal/5 blur-3xl pointer-events-none hidden md:block"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-teal mb-3">
                Результат
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground text-balance leading-[1.15]">
                <span className="block">Что изменится у ребёнка</span>
                <span className="block text-muted-foreground font-semibold mt-1">через несколько месяцев занятий</span>
              </h2>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Мы не обещаем золотых гор. Вот что мы реально видим у детей, которые занимаются у нас регулярно.
              </p>
              <button
                onClick={() => document.querySelector("#enrollment")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="mt-6 inline-flex items-center justify-center min-h-[48px] px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Записаться на пробное занятие
              </button>
            </Reveal>
          </div>

          <div className="lg:col-span-3">
            <Stagger className="space-y-3">
              {results.map((r) => (
                <StaggerItem key={r}>
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-cream/60 dark:bg-white/5 border border-border/40">
                    <CheckCircle2 className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base text-foreground leading-relaxed">{r}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
