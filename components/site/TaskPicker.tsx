"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { parentPains, studioMotto } from "@/data/site";

import { Reveal, Stagger, StaggerItem } from "./Reveal";

const colorMap: Record<string, { bg: string; icon: string; border: string; hoverBg: string }> = {
  amber:   { bg: "bg-amber-50 dark:bg-amber-500/5",   icon: "bg-amber-100 dark:bg-amber-500/10",   border: "border-amber-200/60 dark:border-amber-500/20",   hoverBg: "group-hover:bg-amber-100 dark:group-hover:bg-amber-500/10" },
  blue:    { bg: "bg-blue-50 dark:bg-blue-500/5",     icon: "bg-blue-100 dark:bg-blue-500/10",     border: "border-blue-200/60 dark:border-blue-500/20",     hoverBg: "group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/5",icon: "bg-emerald-100 dark:bg-emerald-500/10", border: "border-emerald-200/60 dark:border-emerald-500/20", hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10" },
  purple:  { bg: "bg-violet-50 dark:bg-violet-500/5", icon: "bg-violet-100 dark:bg-violet-500/10",  border: "border-violet-200/60 dark:border-violet-500/20", hoverBg: "group-hover:bg-violet-100 dark:group-hover:bg-violet-500/10" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-500/5",     icon: "bg-rose-100 dark:bg-rose-500/10",     border: "border-rose-200/60 dark:border-rose-500/20",     hoverBg: "group-hover:bg-rose-100 dark:group-hover:bg-rose-500/10" },
  orange:  { bg: "bg-orange-50 dark:bg-orange-500/5", icon: "bg-orange-100 dark:bg-orange-500/10", border: "border-orange-200/60 dark:border-orange-500/20", hoverBg: "group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10" },
};

export function TaskPicker() {
  return (
    <section id="tasks" className="section-padding relative bg-background overflow-hidden">
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
            С чего начать
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15] max-w-3xl">
            С какой задачей вы пришли?
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Нажмите на то, что похоже на вашу ситуацию — покажем, как именно «Сфера» это решает. Если пока не понимаете, что выбрать — напишите, поможем разобраться.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {parentPains.map((pain) => {
            const color = colorMap[pain.color] ?? colorMap.amber;
            return (
              <StaggerItem key={pain.href}>
                <Link
                  href={pain.href}
                  className={`group block bg-card rounded-2xl border ${color.border} p-5 sm:p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl ${color.icon} flex items-center justify-center text-2xl mb-4 transition-colors ${color.hoverBg}`}>
                    <span aria-hidden="true">{pain.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground leading-snug mb-1">
                    {pain.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {pain.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-warm group-hover:gap-2.5 transition-all">
                    Смотреть направление
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.15}>
          <div className="mt-8 rounded-2xl border border-dashed border-brand-warm/40 bg-brand-warm/5 p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-xl bg-brand-warm/15 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-brand-warm" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-base text-foreground">Не знаете, что выбрать?</p>
              <p className="text-sm text-muted-foreground mt-0.5">Оставьте заявку — поговорим 10 минут и подберём направление под вашего ребёнка.</p>
            </div>
            <button
              onClick={() => document.querySelector("#enrollment")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Помогите подобрать
            </button>
          </div>
        </Reveal>

        {/* Позиционирующая цитата */}
        <Reveal delay={0.1}>
          <blockquote className="mt-14 max-w-3xl mx-auto text-center">
            <p className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-foreground leading-snug text-balance">
              «{studioMotto}»
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">
              — команда студии «Сфера», Горячий Ключ
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
