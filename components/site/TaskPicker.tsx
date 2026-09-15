"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { useContent } from "./ContentContext";
import { iconMap } from "./program-icons";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { cn } from "@/lib/utils";

/**
 * Цвета болей лежат в БД шестью именами (amber/blue/emerald/purple/rose/
 * orange). В палитре сайта два акцента — янтарь и тил, — поэтому старые имена
 * сводятся к ним по температуре: тёплая половина → warm, холодная → teal.
 * Данные править не нужно, а ряд перестаёт выглядеть набором стикеров.
 */
const TONE_BY_COLOR: Record<string, "warm" | "teal"> = {
  amber: "warm",
  orange: "warm",
  rose: "warm",
  yellow: "warm",
  red: "warm",
  blue: "teal",
  emerald: "teal",
  teal: "teal",
  purple: "teal",
  violet: "teal",
  cyan: "teal",
};

const TONE = {
  warm: {
    icon: "bg-brand-warm/12 text-brand-warm-ink ring-brand-warm/25 group-hover:shadow-[0_0_26px_-6px_hsl(var(--brand-warm)/0.7)]",
    hover: "hover:border-brand-warm/45",
  },
  teal: {
    icon: "bg-brand-teal/12 text-brand-teal-ink ring-brand-teal/25 group-hover:shadow-[0_0_26px_-6px_hsl(var(--brand-teal)/0.7)]",
    hover: "hover:border-brand-teal/45",
  },
} as const;

export function TaskPicker() {
  const content = useContent();
  const pains = content.parentPains ?? [];
  const motto = content.studioMotto ?? "";

  return (
    <section id="tasks" className="section-padding relative bg-background overflow-hidden">
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-3">
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
          {pains.map((pain) => {
            const tone = TONE_BY_COLOR[pain.color] ?? "warm";
            const Icon = iconMap[pain.icon] ?? Sparkles;
            return (
              <StaggerItem key={pain.href}>
                <Link
                  href={pain.href}
                  className={cn(
                    "glass group block h-full rounded-2xl p-5 sm:p-6",
                    "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                    "hover:-translate-y-[5px] hover:shadow-[0_30px_56px_-28px_hsl(var(--shadow-hue)/0.4)]",
                    TONE[tone].hover,
                  )}
                >
                  <div
                    className={cn(
                      "mb-4 grid h-12 w-12 place-items-center rounded-full ring-1",
                      "transition-[transform,box-shadow] duration-300 group-hover:scale-[1.07]",
                      TONE[tone].icon,
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground leading-snug mb-1">
                    {pain.title}
                  </h3>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                    {pain.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-warm-ink group-hover:gap-2.5 transition-all">
                    Смотреть направление
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.15}>
          <div className="glass relative mt-8 overflow-hidden rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <span
              aria-hidden
              className="blob-drift pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-brand-warm/20 blur-3xl"
            />
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-brand-warm/12 text-brand-warm-ink ring-1 ring-brand-warm/25">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-base text-foreground">Не знаете, что выбрать?</p>
              <p className="text-sm text-foreground/70 mt-0.5">Оставьте заявку — поговорим 10 минут и подберём направление под вашего ребёнка.</p>
            </div>
            <button
              onClick={() => document.querySelector("#enrollment")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="btn-cta min-h-[48px] px-6 text-sm font-semibold whitespace-nowrap"
            >
              Помогите подобрать
            </button>
          </div>
        </Reveal>

        {/* Позиционирующая цитата */}
        <Reveal delay={0.1}>
          <blockquote className="mt-14 max-w-3xl mx-auto text-center">
            <p className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-foreground leading-snug text-balance">
              «{motto}»
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
