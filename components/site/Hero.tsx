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
      id="hero"
      className="relative min-h-[100dvh] lg:h-screen lg:max-h-screen flex flex-col justify-between pt-16 sm:pt-20 md:pt-20 pb-3 sm:pb-4 lg:pb-5 overflow-hidden mesh-hero"
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

      <div className="container-max w-full px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-between my-auto">
        <div className="grid lg:grid-cols-2 gap-6 xl:gap-10 items-center my-auto">
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
              className="glass inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full ring-1 ring-brand-warm/25 text-foreground text-xs sm:text-sm font-semibold mb-2 sm:mb-3 shadow-sm"
            >
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-foreground/90">{content.heroContent.badge}</span>
            </motion.div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[2.35rem] xl:text-[2.75rem] leading-[1.12] text-foreground text-balance">
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
                "mt-2 text-sm sm:text-base font-display font-semibold bg-gradient-to-r from-brand-teal via-brand-warm to-brand-teal bg-clip-text text-transparent",
                "text-shimmer"
              )}
            >
              {content.heroContent.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="mt-2 sm:mt-2.5 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg"
            >
              {content.heroContent.description}
            </motion.p>

            {/* Кнопки действий + Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="mt-3.5 sm:mt-4 flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
                <button
                  onClick={() => scrollTo("#tasks")}
                  className="btn-cta group h-10 sm:h-11 px-5 font-semibold text-xs sm:text-sm shadow-md shadow-brand-warm/20"
                >
                  {content.heroContent.primaryCta}
                  <ArrowRight className="btn-arrow w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTo("#programs")}
                  className="btn-outline h-10 sm:h-11 px-5 font-semibold text-xs sm:text-sm"
                >
                  {content.heroContent.secondaryCta}
                </button>
              </div>

              {/* Полоса доверия (Social Proof) */}
              <div className="flex items-center gap-2.5 pt-0.5">
                <div className="flex -space-x-1.5 shrink-0">
                  {["/images/gallery-1.jpg", "/images/PF6A7844_resized.jpg", "/images/studio-07.jpg", "/images/PF6A8152_resized.jpg"].map((src, i) => (
                    <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-background overflow-hidden relative shadow-sm">
                      <Image src={src} alt="Ученик студии" fill sizes="28px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-0.5 tabular-nums">4.9</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
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
            className="relative aspect-[16/11] max-h-[260px] sm:max-h-[300px] lg:max-h-[320px] xl:max-h-[360px] w-full will-change-transform [transform-style:preserve-3d]"
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
                <div className="absolute bottom-2.5 inset-x-4 flex items-center justify-center gap-1.5 z-20">
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
            <div className="absolute -inset-2.5 rounded-[2rem] border-2 border-brand-warm/20 -z-10 hidden sm:block" />

            {/* Карточки-факты по углам кадра */}
            <CornerCard
              tone="warm"
              variant="pill"
              label="Возраст детей"
              value="5–15 лет"
              delay={0.7}
              className="-bottom-2 left-2 sm:-bottom-3 sm:left-2 lg:-bottom-2 lg:left-2"
              style={{ x: warmX, y: warmY, z: 46 }}
            />
            <CornerCard
              tone="teal"
              variant="frost"
              label="Опыт работы"
              value="более 15 лет"
              delay={0.85}
              className="-top-2 right-2 sm:-top-3 sm:right-2 lg:-top-2 lg:right-2"
              style={{ x: tealX, y: tealY, z: 62 }}
            />
          </motion.div>
        </div>

        {/* Интегрированные карточки фактов прямо в Hero — стильный центрированный dock */}
        {content.trustStats && content.trustStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-hairline/60 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 w-full"
          >
            {content.trustStats.slice(0, 4).map((s, i) => {
              const warm = i % 2 === 0;
              const value = String(s.value ?? "").trim();
              const label = String(s.label ?? "").trim();
              const desc = String(s.description ?? "").trim();
              const Icon = pickStatIcon(s, i);
              const isNumeric = /^\d/.test(value);

              return (
                <motion.div
                  key={`${value}-${label}-${i}`}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={cn(
                    "group relative flex flex-col items-center justify-center text-center",
                    "rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 lg:p-4 overflow-hidden",
                    // Премиум-стекло (glassmorphism нового поколения)
                    "backdrop-blur-xl bg-white/75 dark:bg-card/45",
                    "border border-white/60 dark:border-white/10",
                    "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05),0_1px_4px_-1px_rgba(0,0,0,0.03)]",
                    "transition-[box-shadow,border-color] duration-300",
                    warm
                      ? "hover:border-brand-warm/45 hover:shadow-[0_16px_36px_-10px_hsl(var(--shadow-tint-warm)/0.4)]"
                      : "hover:border-brand-teal/45 hover:shadow-[0_16px_36px_-10px_hsl(var(--shadow-tint-teal)/0.4)]"
                  )}
                >
                  {/* Фоновый мягкий градиентный блик */}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-30 transition-opacity duration-300 group-hover:opacity-75",
                      warm ? "bg-brand-warm/30" : "bg-brand-teal/30"
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -bottom-10 -left-10 w-20 h-20 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-50",
                      warm ? "bg-brand-teal/20" : "bg-brand-warm/20"
                    )}
                  />

                  {/* Иконка: центрирована, в светящемся бейдже */}
                  <div
                    className={cn(
                      "relative grid place-items-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl ring-1 mb-2",
                      "transition-all duration-300 group-hover:scale-110",
                      warm
                        ? "bg-brand-warm/15 text-brand-warm-ink ring-brand-warm/25 group-hover:shadow-[0_0_16px_hsl(var(--brand-warm)/0.4)]"
                        : "bg-brand-teal/15 text-brand-teal-ink ring-brand-teal/25 group-hover:shadow-[0_0_16px_hsl(var(--brand-teal)/0.4)]"
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                  </div>

                  {/* Значение и заголовок: строго центрированы */}
                  <div className="flex items-baseline justify-center gap-1.5 leading-none">
                    {isNumeric ? (
                      <>
                        <span
                          className={cn(
                            "font-display font-black text-xl sm:text-2xl lg:text-[1.65rem] tabular-nums tracking-tight",
                            warm
                              ? "bg-brand-gradient-warm bg-clip-text text-transparent"
                              : "bg-brand-gradient-teal bg-clip-text text-transparent"
                          )}
                        >
                          {value}
                        </span>
                        {label && (
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground/75">
                            {label}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-display font-black text-base sm:text-lg lg:text-xl text-foreground tracking-tight">
                          {value}
                        </span>
                        {label && (
                          <span
                            className={cn(
                              "text-xs sm:text-sm font-bold uppercase tracking-wider",
                              warm
                                ? "text-brand-warm-ink dark:text-brand-warm-muted"
                                : "text-brand-teal-ink dark:text-brand-teal-muted"
                            )}
                          >
                            {label}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Описание: центрировано */}
                  {desc && (
                    <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium leading-tight text-center max-w-[200px] line-clamp-2">
                      {desc}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

