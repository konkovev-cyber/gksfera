"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useContent } from "./ContentContext";
import { cn } from "@/lib/utils";

const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E";

export function Hero() {
  const content = useContent();
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Гидрация-безопасная проверка: анимации только для тех, кто не просит их убирать
  const [fineMotion, setFineMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference)");
    setFineMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFineMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Прожектор, следующий за курсором
  const sx = useMotionValue(-600);
  const sy = useMotionValue(-600);
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${sx}px ${sy}px, hsl(32 85% 52% / 0.08), transparent 65%)`;

  // 3D-наклон карточки с фото
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotX = useSpring(useTransform(ty, [-0.5, 0.5], [7, -7]), {
    stiffness: 180,
    damping: 22,
  });
  const rotY = useSpring(useTransform(tx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 180,
    damping: 22,
  });

  const onTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!fineMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    tx.set((e.clientX - r.left) / r.width - 0.5);
    ty.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onTiltLeave = () => {
    tx.set(0);
    ty.set(0);
  };

  // Заголовок по словам
  const words = content.heroContent.title.split(" ");
  const marqueeItems = content.programs.map((p) => p.title);

  return (
    <section
      className="relative py-20 md:py-28 lg:py-32 pt-24 md:pt-32 overflow-hidden"
      onMouseMove={(e) => {
        if (!fineMotion) return;
        const r = e.currentTarget.getBoundingClientRect();
        sx.set(e.clientX - r.left);
        sy.set(e.clientY - r.top);
      }}
    >
      {/* Дрейфующие градиентные пятна */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-brand-warm/15 blur-3xl"
          animate={fineMotion ? { x: [0, 40, -20, 0], y: [0, -30, 20, 0] } : undefined}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-28 w-[380px] h-[380px] rounded-full bg-brand-teal/15 blur-3xl"
          animate={fineMotion ? { x: [0, -35, 25, 0], y: [0, 25, -20, 0] } : undefined}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-sand/50 blur-3xl"
          animate={fineMotion ? { x: [0, 20, -15, 0], y: [0, -18, 12, 0] } : undefined}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Текстура шума */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{ backgroundImage: `url("${NOISE}")` }}
      />

      {/* Прожектор за курсором */}
      {fineMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: spotlight }}
        />
      )}

      <div className="container-max w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Текстовая часть */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-warm/10 border border-brand-warm/20 text-brand-warm text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              {content.heroContent.badge}
            </motion.div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl leading-[1.15] text-foreground">
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.045,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {w}
                </motion.span>
              )).reduce((acc, span, i) => (
                i === 0 ? [span] : [...acc, " ", span]
              ), [] as React.ReactNode[])}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className={cn(
                "mt-4 text-lg sm:text-xl font-display font-semibold bg-gradient-to-r from-brand-teal via-brand-warm to-brand-teal bg-clip-text text-transparent",
                fineMotion && "text-shimmer"
              )}
            >
              {content.heroContent.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              {content.heroContent.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => scrollTo("#enrollment")}
                className="group inline-flex items-center justify-center gap-2 h-12 sm:h-13 px-7 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {content.heroContent.primaryCta}
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollTo("#programs")}
                className="inline-flex items-center justify-center h-12 sm:h-13 px-7 rounded-full border-2 border-border bg-card/80 backdrop-blur-sm text-foreground font-semibold text-base hover:border-primary hover:text-primary transition-all"
              >
                {content.heroContent.secondaryCta}
              </button>
            </motion.div>
          </motion.div>

          {/* Изображение с 3D-наклоном */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={onTiltMove}
            onMouseLeave={onTiltLeave}
            style={
              fineMotion
                ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }
                : undefined
            }
            className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-square will-change-transform"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <Image
                src={content.heroContent.image}
                alt={content.heroContent.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Блик-градиент поверх фото */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/15 via-transparent to-brand-warm/10 mix-blend-overlay" />
            </div>
            <div className="absolute -inset-3 rounded-[2rem] border-2 border-brand-warm/20 -z-10 hidden sm:block" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 rounded-2xl shadow-lg shadow-brand-warm/30 bg-brand-warm text-white border border-white/25 p-4 sm:p-5 max-w-[220px] flex flex-col items-center text-center"
            >
              <p className="text-[11px] uppercase tracking-wider font-semibold text-white/85">
                Возраст детей
              </p>
              <p className="text-xl sm:text-2xl font-display font-extrabold mt-0.5">
                5–15 лет
              </p>
              <p className="text-xs text-white/90 mt-1">
                Дошкольники и школьники
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 bg-brand-teal text-white rounded-2xl shadow-xl px-4 py-3 text-center"
            >
              <p className="text-xs text-white/70 font-medium">Опыт работы</p>
              <p className="text-base font-display font-bold">более 15 лет</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Бегущая строка направлений */}
      <div className="mt-14 md:mt-16 relative z-10 border-y border-border/60 bg-card/60 backdrop-blur-sm py-3.5 overflow-hidden">
        {fineMotion ? (
          <div className="flex w-max animate-marquee">
            {[...marqueeItems, ...marqueeItems].map((t, i) => (
              <span
                key={i}
                className="flex items-center gap-2.5 pr-10 text-sm font-semibold text-brand-warm whitespace-nowrap"
              >
                {t}
                <span
                  className="w-1.5 h-1.5 rounded-full bg-brand-teal/70 inline-block"
                  aria-hidden="true"
                />
              </span>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 px-4">
            {marqueeItems.map((t) => (
              <span key={t} className="text-sm font-semibold text-brand-warm">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
