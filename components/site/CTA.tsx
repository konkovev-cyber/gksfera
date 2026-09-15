"use client";

import { ArrowRight, Send } from "lucide-react";
import { useContent } from "./ContentContext";

import { Reveal } from "./Reveal";

export function CTA() {
  const content = useContent();
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-max">
        <Reveal>
          {/* Залитая панель. Держится на --panel (глубокий тил), а не на
              --brand-teal: в тёмной теме брендовый тил яркий, и белый текст на
              нём давал 1.12:1. Панель в обеих темах остаётся тёмной — потому и
              белый текст, и белые орнаменты на ней живы всегда. */}
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 text-center bg-gradient-to-br from-panel to-panel-2 shadow-[0_36px_80px_-44px_hsl(var(--brand-teal)/0.55)]">
            {/* Декоративные элементы */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-warm/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/6 blur-2xl pointer-events-none"
              aria-hidden="true"
            />
            <svg
              className="absolute top-8 right-8 w-24 h-24 opacity-15"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div className="relative z-10 max-w-2xl mx-auto text-panel-foreground">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-balance leading-[1.15]">
                Познакомьтесь со «Сферой»
              </h2>
              <p className="mt-6 text-lg text-panel-foreground/80 leading-relaxed">
                Расскажите, сколько лет ребёнку и что вас сейчас интересует.
                Мы поможем подобрать подходящее направление.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => scrollTo("#enrollment")}
                  className="group inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-7 rounded-full bg-white text-panel font-semibold text-base shadow-[0_18px_36px_-18px_rgba(0,0,0,0.55)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-18px_rgba(0,0,0,0.6)]"
                >
                  <Send className="btn-arrow w-5 h-5" />
                  Записаться / задать вопрос
                </button>
                <a
                  href={content.siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-7 rounded-full border border-panel-foreground/35 text-panel-foreground font-semibold text-base transition-colors hover:bg-panel-foreground/10"
                >
                  Написать в VK
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
