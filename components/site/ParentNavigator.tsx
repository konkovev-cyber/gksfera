"use client";

import { Compass } from "lucide-react";
import { parentOptions, programs } from "@/data/site";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

export function ParentNavigator() {
  const scrollToProgram = (programId: string) => {
    const el = document.querySelector("#programs");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Дополнительно подсветим нужную карточку после прокрутки
      setTimeout(() => {
        const card = document.querySelector(`[data-program-id="${programId}"]`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
          setTimeout(() => {
            card.classList.remove("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
          }, 2500);
        }
      }, 500);
    }
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-brand-teal/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-sm font-semibold mb-5">
              <Compass className="w-4 h-4" />
              Поможем выбрать
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
              Ищете занятия для своего ребёнка?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Выберите, что ближе всего — и мы покажем подходящее направление.
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto" delay={0.1}>
          {parentOptions.map((option) => (
            <StaggerItem key={option.id}>
              <button
                onClick={() => scrollToProgram(option.targetProgramId)}
                className="w-full px-4 py-4 sm:py-5 rounded-2xl bg-card border border-border/60 hover:border-primary hover:bg-brand-warm/5 transition-all text-left group"
              >
                <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {option.label}
                </span>
              </button>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Не уверены?{" "}
            <button
              onClick={() => {
                const el = document.querySelector("#enrollment");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="font-semibold text-brand-warm hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Запишитесь на консультацию
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
