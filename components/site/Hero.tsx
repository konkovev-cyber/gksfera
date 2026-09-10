"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { heroContent } from "@/data/site";

export function Hero() {
  const reduced = useReducedMotion();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center pt-20 md:pt-24 overflow-hidden">
      {/* Декоративные сферы */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-brand-warm/10 blur-3xl"
        />
        <div
          className="absolute top-1/2 -left-32 w-[350px] h-[350px] rounded-full bg-brand-teal/10 blur-3xl"
        />
        {!reduced && (
          <motion.div
            className="absolute top-[15%] right-[8%] w-3 h-3 rounded-full bg-brand-warm"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {!reduced && (
          <motion.div
            className="absolute bottom-[20%] left-[12%] w-2.5 h-2.5 rounded-full bg-brand-teal"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        )}
        {/* Кольцо-орбита */}
        <svg
          className="absolute top-[10%] right-[5%] w-32 h-32 opacity-20"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--brand-warm))" strokeWidth="1" />
          <circle cx="95" cy="50" r="3" fill="hsl(var(--brand-warm))" />
        </svg>
      </div>

      <div className="container-max w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Текстовая часть */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-warm/10 border border-brand-warm/20 text-brand-warm text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              {heroContent.badge}
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl leading-[1.1] text-foreground text-balance">
              {heroContent.title}
            </h1>

            <p className="mt-4 text-lg sm:text-xl font-display font-semibold text-brand-teal">
              {heroContent.tagline}
            </p>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
              {heroContent.description}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => scrollTo("#enrollment")}
                className="inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-7 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {heroContent.primaryCta}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTo("#programs")}
                className="inline-flex items-center justify-center h-12 sm:h-13 px-7 rounded-full border-2 border-border bg-card text-foreground font-semibold text-base hover:border-primary hover:text-primary transition-all"
              >
                {heroContent.secondaryCta}
              </button>
            </div>
          </motion.div>

          {/* Изображение */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-square"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={heroContent.image}
                alt={heroContent.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* Декоративное кольцо вокруг фото */}
            <div className="absolute -inset-3 rounded-[2rem] border-2 border-brand-warm/20 -z-10 hidden sm:block" />
            {/* Плавающий бейдж */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-card rounded-2xl shadow-xl p-4 border border-border/50 max-w-[200px]"
            >
              <p className="text-xs text-muted-foreground font-medium">Возраст детей</p>
              <p className="text-lg font-display font-bold text-foreground">5–15 лет</p>
              <p className="text-xs text-muted-foreground mt-1">Дошкольники и школьники</p>
            </motion.div>
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 bg-brand-teal text-white rounded-2xl shadow-xl px-4 py-3"
            >
              <p className="text-xs text-white/70 font-medium">Опыт работы</p>
              <p className="text-base font-display font-bold">более 15 лет</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
