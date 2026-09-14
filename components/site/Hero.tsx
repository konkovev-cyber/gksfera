"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, Pause, Play } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useContent } from "./ContentContext";
import { HeroBanners } from "./HeroBanners";
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
  // Бегущую строку можно остановить кнопкой — это требование WCAG 2.2.2
  // (движущийся контент должен останавливаться по запросу) и просто удобство:
  // при системном «уменьшить движение» строка едет медленно, а при желании
  // останавливается совсем.
  const [marqueePaused, setMarqueePaused] = useState(false);

  // Набор фото для ротации в Hero (fallback на одиночное image)
  const heroImages = (
    content.heroContent.images && content.heroContent.images.length > 0
      ? content.heroContent.images
      : [content.heroContent.image]
  ).filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => {
    if (!fineMotion || heroImages.length <= 1) return;
    const id = window.setInterval(
      () => setActiveImg((i) => (i + 1) % heroImages.length),
      7000, // смена раз в 7 секунд — не слишком часто
    );
    return () => window.clearInterval(id);
    // activeImg в зависимостях: ручной клик по точке перезапускает таймер,
    // чтобы авто-смена не «догоняла» через долю секунды после выбора вручную.
  }, [fineMotion, heroImages.length, activeImg]);
  // Защита от выхода за границы после изменения набора в админке
  const safeIdx = heroImages.length > 0 ? activeImg % heroImages.length : 0;

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
                onClick={() => scrollTo("#tasks")}
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

            {/* Trust-строка под кнопками */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-5 text-xs sm:text-sm text-muted-foreground"
            >
              5–15 лет · небольшие группы · более 15 лет работы · Горячий Ключ
            </motion.p>

            {/* Промо-баннеры («облачные чипы») — настраиваются в админке */}
            <HeroBanners />
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
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-muted" data-hero-rotate>
              {/* Ротация фото: кроссфейд + медленный Ken Burns (scale). */}
              <AnimatePresence>
                {heroImages.map((src, i) =>
                  i === safeIdx ? (
                    <motion.div
                      key={src + "-" + i}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.4, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        initial={false}
                        animate={
                          fineMotion
                            ? { scale: heroImages.length > 1 ? [1.02, 1.12] : 1 }
                            : { scale: 1 }
                        }
                        transition={{ duration: 8, ease: "linear" }}
                      >
                        <Image
                          src={src}
                          alt={content.heroContent.imageAlt}
                          fill
                          priority={i === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </motion.div>
                    </motion.div>
                  ) : null,
                )}
              </AnimatePresence>
              {/* Блик-градиент поверх фото */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/15 via-transparent to-brand-warm/10 mix-blend-overlay pointer-events-none" />

              {/* Индикатор ротации — точки (только если фото больше одного) */}
              {heroImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {heroImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Показать фото ${i + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === safeIdx ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                      )}
                    />
                  ))}
                </div>
              )}
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
      <div className="mt-14 md:mt-16 relative z-10 overflow-hidden">
        {/* Тень-градиент сверху и снизу */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-warm/40 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-warm/40 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-warm/5 via-card to-brand-warm/5" aria-hidden="true" />

        <div className="relative py-7 overflow-hidden shadow-[inset_0_2px_8px_-4px_rgba(0,0,0,0.06),inset_0_-2px_8px_-4px_rgba(0,0,0,0.06)]">
          <div className={cn("flex w-max animate-marquee", marqueePaused && "marquee-paused")} aria-hidden="true">
            {(() => {
              const N = marqueeItems.length || 1;
              const WAVE_PERIOD = 7; // сек — совпадает с @keyframes marquee-wave
              return [...marqueeItems, ...marqueeItems].map((t, i) => {
                // Фаза синусоиды по позиции элемента. Отрицательная задержка,
                // чтобы волна была «в разгаре» сразу при рендере, и повторялась
                // каждые N элементов — бесшовно на стыке дубля строки.
                const delay = -((i % N) / N) * WAVE_PERIOD;
                return (
                  <span
                    key={i}
                    className={cn("flex items-center whitespace-nowrap", fineMotion && "marquee-wave")}
                    style={{ animationDelay: `${delay}s` }}
                  >
                    <span className="text-sm sm:text-[0.95rem] font-display font-bold text-brand-warm tracking-wide uppercase">
                      {t}
                    </span>
                    <span
                      className="mx-5 sm:mx-7 flex items-center gap-1"
                      aria-hidden="true"
                    >
                      <span className="w-1 h-1 rounded-full bg-brand-teal" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-warm" />
                      <span className="w-1 h-1 rounded-full bg-brand-teal" />
                    </span>
                  </span>
                );
              });
            })()}
          </div>

          {/* Мягкий градиент справа, чтобы текст не уходил под кнопку паузы */}
          <div
            className="absolute inset-y-0 right-0 w-16 sm:w-20 bg-gradient-to-l from-card via-card/90 to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* Пауза/пуск бегущей строки */}
          <button
            type="button"
            onClick={() => setMarqueePaused((v) => !v)}
            aria-pressed={marqueePaused}
            aria-label={marqueePaused ? "Запустить бегущую строку" : "Остановить бегущую строку"}
            title={marqueePaused ? "Запустить бегущую строку" : "Остановить бегущую строку"}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-border/70 bg-card/85 backdrop-blur-sm text-muted-foreground hover:text-brand-warm hover:border-brand-warm/70 transition-colors flex items-center justify-center"
          >
            {marqueePaused ? (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
