"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Star,
  Award,
  Users,
  HeartHandshake,
  MapPin,
  Compass,
  CalendarCheck,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useContent } from "./ContentContext";
import { cn } from "@/lib/utils";

type Stat = { value?: string; label?: string; description?: string };

const STAT_ICON_RULES: [RegExp, LucideIcon][] = [
  [/возраст|ученик|школьник|дет/i, Users],
  [/работ|опыт|лет|год/i, Award],
  [/групп|каждый ребёнок|вниман/i, HeartHandshake],
  [/город|адрес|пер\.|ул\.|центр|наход/i, MapPin],
  [/направл|программ|предмет|курс/i, Compass],
  [/пробн|бесплатн|знак|пробовать/i, Sparkles],
  [/распис|занят|час|дней|график/i, CalendarCheck],
  [/отзыв|родител|сем|довольн/i, Star],
  [/препода|педаго|учит|образов/i, GraduationCap],
];

const FALLBACK_STAT_ICONS: LucideIcon[] = [Sparkles, Award, Users, MapPin];

function pickStatIcon(stat: Stat, index: number): LucideIcon {
  const hay = `${stat.value ?? ""} ${stat.label ?? ""} ${stat.description ?? ""}`;
  for (const [re, icon] of STAT_ICON_RULES) if (re.test(hay)) return icon;
  return FALLBACK_STAT_ICONS[index % FALLBACK_STAT_ICONS.length];
}

const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E";

/**
 * Угловая карточка-факт поверх фото: висит снаружи угла рамки — за счёт этого
 * кадр с наклоном читается объёмным. Карточка едет вместе с ним и слегка против
 * курсора, верхним слоем (translateZ).
 *
 * Два варианта подложки — оба светлые, тёмных «заплаток» на кадре больше нет:
 *  • "frost" — матовое стекло (.glass-frost): плотность 66% (--frost-a), blur,
 *    волосяная белая рамка, скругление 24px. Текст графитовый (--frost-ink).
 *  • "pill"  — белая «пилюля» (.paper-plate) с обводкой фирменным цветом и
 *    числом фиксированными чернилами плашки (--plate-*-ink: 5.9:1 и 9.6:1 на
 *    белом). Обычные --brand-*-ink не подходят: они светлеют в тёмной теме.
 * Плашки принадлежат кадру, а не странице, поэтому в тёмной теме они не
 * переворачиваются: фото там то же самое.
 */
function CornerCard({
  label,
  value,
  note,
  tone,
  variant,
  className,
  style,
  delay,
}: {
  label: string;
  value: string;
  note?: string;
  tone: "warm" | "teal";
  variant: "frost" | "pill";
  className: string;
  style?: Record<string, unknown>;
  delay: number;
}) {
  const frost = variant === "frost";
  return (
    <motion.div
      initial={{ opacity: 0, y: tone === "warm" ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={style}
      data-hero-card={tone}
      className={cn(
        "absolute text-center",
        frost
          ? "glass-frost rounded-3xl px-4 py-3 sm:px-5 sm:py-3.5"
          : cn(
              // Обводка и число — фиксированными «чернилами плашки»: пилюля
              // белая в обеих темах, а brand-*-ink в тёмной светлеет.
              "paper-plate rounded-full px-5 py-2.5 sm:px-6 sm:py-3",
              tone === "warm" ? "[--plate-tint:var(--plate-warm-ink)]" : "[--plate-tint:var(--plate-teal-ink)]",
            ),
        className,
      )}
    >
      <p className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-frost-muted">
        <span
          aria-hidden="true"
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", tone === "warm" ? "bg-brand-warm" : "bg-brand-teal")}
        />
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-display font-extrabold leading-none text-xl sm:text-2xl tabular-nums",
          frost ? "text-frost-ink" : tone === "warm" ? "text-plate-warm" : "text-plate-teal",
        )}
      >
        {value}
      </p>
      {note && <p className="mt-1 text-[11px] leading-tight text-frost-muted">{note}</p>}
    </motion.div>
  );
}

export function Hero() {
  const content = useContent();
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Прожектор, следующий за курсором
  const sx = useMotionValue(-600);
  const sy = useMotionValue(-600);
  // Пятно света за курсором. Тон берётся из токена: литерал старой палитры
  // (32 85% 52%) рассинхронизировался бы с --brand-warm при смене темы.
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${sx}px ${sy}px, hsl(var(--brand-warm) / 0.09), transparent 65%)`;

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
  // Собственно объём читают угловые карточки: они едут ПРОТИВ наклона кадра
  // (слои смещаются в разные стороны → глаз видит разницу глубин) и подняты
  // по Z. Без них наклон почти незаметен — отсюда ощущение «раньше двигалось».
  // Пружины объявлены плоско: вызов useSpring из вспомогательной функции
  // ломает правила хуков (react-hooks/rules-of-hooks).
  const spring = { stiffness: 160, damping: 20 };
  const warmX = useSpring(useTransform(tx, [-0.5, 0.5], [16, -16]), spring);
  const warmY = useSpring(useTransform(ty, [-0.5, 0.5], [10, -10]), spring);
  const tealX = useSpring(useTransform(tx, [-0.5, 0.5], [-20, 20]), spring);
  const tealY = useSpring(useTransform(ty, [-0.5, 0.5], [-12, 12]), spring);

  const onTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // Смена фото в герое: кадры листаются каждые 7 секунд кроссфейдом.
  // При системном «уменьшить движение» переход мгновенный (transition:0),
  // ротация сохраняется — глазу достаточно смены без анимации.
  const heroImages = (
    content.heroContent.images && content.heroContent.images.length > 0
      ? content.heroContent.images
      : [content.heroContent.image]
  ).filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = window.setInterval(() => setActiveImg((i) => (i + 1) % heroImages.length), 7000);
    return () => window.clearInterval(id);
  }, [heroImages.length]);
  // Набор могли поменять в админке — не выходим за границы.
  const safeIdx = heroImages.length > 0 ? activeImg % heroImages.length : 0;
  const heroPhoto = heroImages[safeIdx];

  /**
   * Кадр имеет ФИКСИРОВАННОЕ соотношение сторон и заполняется снимком через
   * object-cover: раньше рамка подстраивалась под отношение сторон текущего
   * фото (0.85…1.5), из-за чего альбомный и книжный снимки меняли размер
   * блока, а вместе с ним прыгала высота героя и посадка угловых плашек.
   * Теперь размер кадра постоянный, а разница ориентаций разрешается обрезкой.
   */

  return (
    <section
      className="relative pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 md:pb-8 overflow-hidden mesh-hero"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        sx.set(e.clientX - r.left);
        sy.set(e.clientY - r.top);
      }}
    >
      {/* Mesh-градиент: четыре радиальных пятна */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-brand-warm/15 blur-3xl"
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-28 w-[380px] h-[380px] rounded-full bg-brand-teal/15 blur-3xl"
          animate={{ x: [0, -35, 25, 0], y: [0, 25, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-sand/50 blur-3xl"
          animate={{ x: [0, 20, -15, 0], y: [0, -18, 12, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Текстура шума */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE}")` }}
      />

      {/* Прожектор за курсором */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlight }}
      />

      <div className="container-max w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Текстовая часть */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            {/* Живой бейдж со статус-индикатором */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              data-hero-badge
              className="glass inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full ring-1 ring-brand-warm/25 text-foreground text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-sm"
            >
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-foreground/90">{content.heroContent.badge}</span>
            </motion.div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] xl:text-[2.85rem] leading-[1.12] text-foreground text-balance">
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
                "mt-2.5 sm:mt-3 text-base sm:text-lg font-display font-semibold bg-gradient-to-r from-brand-teal via-brand-warm to-brand-teal bg-clip-text text-transparent",
                "text-shimmer"
              )}
            >
              {content.heroContent.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg"
            >
              {content.heroContent.description}
            </motion.p>

            {/* Кнопки действий + Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="mt-5 sm:mt-6 flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <button
                  onClick={() => scrollTo("#tasks")}
                  className="btn-cta group h-11 sm:h-12 px-6 font-semibold text-sm sm:text-base shadow-lg shadow-brand-warm/20"
                >
                  {content.heroContent.primaryCta}
                  <ArrowRight className="btn-arrow w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => scrollTo("#programs")}
                  className="btn-outline h-11 sm:h-12 px-6 font-semibold text-sm sm:text-base"
                >
                  {content.heroContent.secondaryCta}
                </button>
              </div>

              {/* Полоса доверия (Social Proof) */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex -space-x-2 shrink-0">
                  {["/images/gallery-1.jpg", "/images/PF6A7844_resized.jpg", "/images/studio-07.jpg", "/images/PF6A8152_resized.jpg"].map((src, i) => (
                    <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-background overflow-hidden relative shadow-sm">
                      <Image src={src} alt="Ученик студии" fill sizes="32px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-1 tabular-nums">4.9</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Более 80 довольных семей · Горячий Ключ
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Изображение с 3D-наклоном и компактным кадрированием */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={onTiltMove}
            onMouseLeave={onTiltLeave}
            style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
            className="relative aspect-[4/3] max-h-[350px] sm:max-h-[390px] w-full will-change-transform [transform-style:preserve-3d]"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-hairline/60 bg-muted" data-hero-frame>
              <AnimatePresence>
                <motion.div
                  key={heroPhoto}
                  data-hero-photo
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 hero-breathe">
                    <Image
                      src={heroPhoto}
                      alt={content.heroContent.imageAlt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
              {/* Блик-градиент поверх фото */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/15 via-transparent to-brand-warm/10 mix-blend-overlay pointer-events-none" />

              {/* Stories-индикатор фотослайдов */}
              {heroImages.length > 1 && (
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-center gap-1.5 z-20">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImg(idx);
                      }}
                      aria-label={`Перейти к фото ${idx + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        idx === safeIdx
                          ? "w-7 bg-white shadow-sm"
                          : "w-1.5 bg-white/50 hover:bg-white/80"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="absolute -inset-3 rounded-[2rem] border-2 border-brand-warm/20 -z-10 hidden sm:block" />

            {/* Карточки-факты по углам кадра */}
            <CornerCard
              tone="warm"
              variant="pill"
              label="Возраст детей"
              value="5–15 лет"
              delay={0.7}
              className="-bottom-4 left-0 sm:-bottom-6 sm:-left-6"
              style={{ x: warmX, y: warmY, z: 46 }}
            />
            <CornerCard
              tone="teal"
              variant="frost"
              label="Опыт работы"
              value="более 15 лет"
              delay={0.85}
              className="-top-3 right-0 sm:-top-5 sm:-right-5"
              style={{ x: tealX, y: tealY, z: 62 }}
            />
          </motion.div>
        </div>

        {/* Интегрированные карточки фактов прямо в Hero */}
        {content.trustStats && content.trustStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-hairline/60 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5"
          >
            {content.trustStats.slice(0, 4).map((s, i) => {
              const warm = i % 2 === 0;
              const value = String(s.value ?? "").trim();
              const label = String(s.label ?? "").trim();
              const desc = String(s.description ?? "").trim();
              const Icon = pickStatIcon(s, i);

              return (
                <div
                  key={`${value}-${label}-${i}`}
                  className={cn(
                    "glass group relative flex flex-col justify-center rounded-2xl p-3 sm:p-3.5 overflow-hidden",
                    "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                    "hover:-translate-y-0.5 hover:border-brand-warm/40",
                    warm
                      ? "hover:shadow-[0_16px_30px_-12px_hsl(var(--shadow-tint-warm)/0.35)]"
                      : "hover:shadow-[0_16px_30px_-12px_hsl(var(--shadow-tint-teal)/0.35)]"
                  )}
                >
                  {/* Фоновый мягкий блик */}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl opacity-30 transition-opacity group-hover:opacity-70",
                      warm ? "bg-brand-warm/30" : "bg-brand-teal/30"
                    )}
                  />

                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "grid place-items-center w-7 h-7 rounded-lg ring-1 shrink-0",
                        "transition-transform duration-300 group-hover:scale-105",
                        warm
                          ? "bg-brand-warm/15 text-brand-warm-ink ring-brand-warm/30"
                          : "bg-brand-teal/15 text-brand-teal-ink ring-brand-teal/30"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span
                        className={cn(
                          "font-display font-extrabold text-base sm:text-lg md:text-xl tabular-nums leading-none tracking-tight",
                          warm
                            ? "bg-brand-gradient-warm bg-clip-text text-transparent"
                            : "bg-brand-gradient-teal bg-clip-text text-transparent"
                        )}
                      >
                        {value}
                      </span>
                      {label && (
                        <span className="text-[11px] sm:text-xs font-semibold text-foreground/80 truncate">
                          {label}
                        </span>
                      )}
                    </div>
                  </div>
                  {desc && (
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 pl-0.5">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
