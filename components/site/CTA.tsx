"use client";

import { ArrowRight, Send } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Reveal } from "./Reveal";

export function CTA() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-max">
        <Reveal>
          <div className="relative rounded-3xl bg-brand-teal overflow-hidden p-8 sm:p-12 md:p-16 text-center">
            {/* Декоративные элементы */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none"
              aria-hidden="true"
            />
            <svg
              className="absolute top-8 right-8 w-24 h-24 opacity-10"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="1" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="1" />
            </svg>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white text-balance leading-[1.15]">
                Познакомьтесь со «Сферой»
              </h2>
              <p className="mt-6 text-lg text-white/80 leading-relaxed">
                Расскажите, сколько лет ребёнку и что вас сейчас интересует.
                Мы поможем подобрать подходящее направление.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => scrollTo("#enrollment")}
                  className="inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-7 rounded-full bg-white text-brand-teal font-semibold text-base hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="w-5 h-5" />
                  Записаться / задать вопрос
                </button>
                <a
                  href={siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-7 rounded-full border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-all"
                >
                  Написать во VK
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
