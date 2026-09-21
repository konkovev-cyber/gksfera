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
  Phone,
  MessageCircle,
  ChevronRight,
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

/** Красивый контактный бейдж — телефон + мессенджеры прямо в Hero */
function ContactBadge() {
  const content = useContent();
  const cfg = content.siteConfig;

  const links = [
    cfg.phoneHref && {
      href: cfg.phoneHref,
      label: cfg.phone,
      icon: <Phone className="w-4 h-4" />,
      cls: "bg-brand-warm/10 text-brand-warm-ink hover:bg-brand-warm/20 ring-brand-warm/30",
    },
    cfg.maxUrl && {
      href: cfg.maxUrl,
      label: "MAX",
      icon: <MessageCircle className="w-4 h-4" />,
      cls: "bg-brand-teal/10 text-brand-teal-ink hover:bg-brand-teal/20 ring-brand-teal/30",
    },
    cfg.vkUrl && {
      href: cfg.vkUrl,
      label: "ВКонтакте",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M19.915 13.028c-.388-.49-.277-.708 0-1.146.005-.005 3.851-5.306 4.246-7.107l.002-.007c.194-.65 0-1.128-.947-1.128h-3.135c-.796 0-1.163.414-1.357.874 0 0-1.587 3.782-3.836 6.237-.727.713-1.057.94-1.453.94-.199 0-.487-.227-.487-.877V4.768c0-.783-.232-1.128-.897-1.128H8.708c-.502 0-.803.365-.803.712 0 .75 1.138.924 1.255 3.036v4.588c0 .995-.183 1.175-.579 1.175-1.057 0-3.625-3.802-5.148-8.15C3.143 3.36 2.84 3 2.038 3H-.097C-1 3 -1.2 3.414-1.2 3.874c0 .806 1.057 4.802 4.921 10.088 2.576 3.641 6.203 5.614 9.507 5.614 1.981 0 2.225-.437 2.225-1.19v-2.749c0-.888.19-1.064.832-1.064.472 0 1.28.233 3.169 2.028C21.438 18.378 21.771 19 22.847 19h3.135c.902 0 1.354-.437 1.092-1.302-.285-.862-1.294-2.11-2.636-3.59-.727-.84-1.818-1.742-2.523-2.08z" />
        </svg>
      ),
      cls: "bg-[#0077FF]/10 text-[#0055CC] hover:bg-[#0077FF]/20 ring-[#0077FF]/30 dark:text-[#4DA6FF]",
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; cls: string }[];

  if (!links.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.45 }}
      className="flex flex-wrap items-center gap-2 pt-1"
    >
      <span className="text-xs text-muted-foreground font-medium shrink-0">Связаться:</span>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target={l.href.startsWith("http") ? "_blank" : undefined}
          rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={l.label}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            "ring-1 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm",
            l.cls
          )}
        >
          {l.icon}
          <span>{l.label}</span>
        </a>
      ))}
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
      className="relative min-h-[100dvh] lg:min-h-screen flex flex-col justify-center pt-20 sm:pt-22 lg:pt-24 pb-4 sm:pb-6 lg:pb-8 overflow-hidden mesh-hero"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        sx.set(e.clientX - r.left);
        sy.set(e.clientY - r.top);
      }}
    >
      {/* Mesh-градиент: четыре радиальных пятна */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-brand-warm/15 blur-3xl"
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-28 w-[420px] h-[420px] rounded-full bg-brand-teal/15 blur-3xl"
          animate={{ x: [0, -35, 25, 0], y: [0, 25, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full bg-brand-sand/50 blur-3xl"
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

      <div className="container-max max-w-[1360px] w-full px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10 flex-1 flex flex-col justify-center gap-4 sm:gap-5 lg:gap-6 my-auto">
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 items-center">
          {/* Текстовая часть */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl xl:max-w-2xl"
          >
            {/* Живой бейдж со статус-индикатором */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              data-hero-badge
              className="glass inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full ring-1 ring-brand-warm/25 text-foreground text-xs sm:text-sm font-semibold mb-3.5 sm:mb-4.5 shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-foreground/90">{content.heroContent.badge}</span>
            </motion.div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[2.35rem] xl:text-[2.75rem] leading-[1.32] sm:leading-[1.35] lg:leading-[1.38] tracking-[-0.015em] text-foreground text-balance">
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform align-baseline"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.04,
                    duration: 0.45,
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
                "mt-3.5 sm:mt-4 text-base sm:text-lg xl:text-xl font-display font-bold bg-gradient-to-r from-brand-teal via-brand-warm to-brand-teal bg-clip-text text-transparent",
                "text-shimmer"
              )}
            >
              {content.heroContent.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="mt-3 sm:mt-3.5 text-sm sm:text-base xl:text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              {content.heroContent.description}
            </motion.p>

            {/* Кнопки действий + Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="mt-5 sm:mt-6 flex flex-col gap-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 xl:gap-4">
                <button
                  onClick={() => scrollTo("#tasks")}
                  className="btn-cta group h-11 sm:h-12 px-6 xl:px-7 font-bold text-sm sm:text-base shadow-lg shadow-brand-warm/25 rounded-2xl"
                >
                  {content.heroContent.primaryCta}
                  <ArrowRight className="btn-arrow w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => scrollTo("#programs")}
                  className="btn-outline h-11 sm:h-12 px-6 xl:px-7 font-bold text-sm sm:text-base rounded-2xl"
                >
                  {content.heroContent.secondaryCta}
                </button>
              </div>

              {/* Полоса доверия (Social Proof) */}
              <div className="flex items-center gap-3 pt-0.5">
                <div className="flex -space-x-2 shrink-0">
                  {["/images/gallery-1.jpg", "/images/PF6A7844_resized.jpg", "/images/studio-07.jpg", "/images/PF6A8152_resized.jpg"].map((src, i) => (
                    <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 xl:w-8.5 xl:h-8.5 rounded-full border-2 border-background overflow-hidden relative shadow-sm">
                      <Image src={src} alt="Ученик студии" fill sizes="34px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs sm:text-sm font-extrabold text-foreground ml-1 tabular-nums">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Более 80 довольных семей · Горячий Ключ
                  </p>
                </div>
              </div>

              {/* Контактный бейдж — телефон + мессенджеры */}
              <ContactBadge />
            </motion.div>
          </motion.div>

          {/* Изображение с 3D-наклоном */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={onTiltMove}
            onMouseLeave={onTiltLeave}
            style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
            className="relative aspect-[16/11] sm:aspect-[4/3] lg:aspect-[16/11] xl:aspect-[4/3] max-h-[350px] sm:max-h-[390px] lg:max-h-[410px] xl:max-h-[450px] w-full will-change-transform [transform-style:preserve-3d]"
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
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-center gap-2 z-20">
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
                        "h-2 rounded-full transition-all duration-300",
                        idx === safeIdx
                          ? "w-8 bg-white shadow-md"
                          : "w-2 bg-white/50 hover:bg-white/80"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="absolute -inset-3 rounded-[2.25rem] border-2 border-brand-warm/20 -z-10 hidden sm:block" />

            {/* Карточки-факты по углам кадра */}
            <CornerCard
              tone="warm"
              variant="pill"
              label="Возраст детей"
              value="5–15 лет"
              delay={0.7}
              className="-bottom-3 left-2 sm:-bottom-4 sm:left-2 lg:-bottom-3 lg:left-3"
              style={{ x: warmX, y: warmY, z: 46 }}
            />
            <CornerCard
              tone="teal"
              variant="frost"
              label="Опыт работы"
              value="более 15 лет"
              delay={0.85}
              className="-top-3 right-2 sm:-top-4 sm:right-2 lg:-top-3 lg:right-3"
              style={{ x: tealX, y: tealY, z: 62 }}
            />
          </motion.div>
        </div>

        {/* Интегрированные карточки фактов прямо в Hero — компактный стильный dock */}
        {content.trustStats && content.trustStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 xl:gap-4 w-full"
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
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className={cn(
                    "group relative flex flex-col items-center justify-center text-center",
                    "rounded-xl sm:rounded-2xl py-2 px-2.5 sm:py-2.5 sm:px-3.5 overflow-hidden",
                    // Премиум-стекло с поддержкой светлой и тёмной тем
                    "backdrop-blur-md bg-white/75 dark:bg-card/55",
                    "border border-hairline/70 dark:border-white/10",
                    "shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.5)]",
                    "transition-all duration-300 ease-out",
                    warm
                      ? "hover:border-brand-warm/40 dark:hover:border-brand-warm/40 hover:shadow-[0_8px_20px_-6px_hsl(var(--shadow-tint-warm)/0.3)]"
                      : "hover:border-brand-teal/40 dark:hover:border-brand-teal/40 hover:shadow-[0_8px_20px_-6px_hsl(var(--shadow-tint-teal)/0.3)]"
                  )}
                >
                  {/* Фоновый мягкий градиентный блик */}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl opacity-20 dark:opacity-30 transition-opacity duration-300 group-hover:opacity-60",
                      warm ? "bg-brand-warm/30" : "bg-brand-teal/30"
                    )}
                  />

                  {/* Иконка: компактная, центрирована */}
                  <div
                    className={cn(
                      "relative grid place-items-center w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg ring-1 mb-1",
                      "transition-all duration-300 group-hover:scale-105",
                      warm
                        ? "bg-brand-warm/15 text-brand-warm-ink dark:text-brand-warm ring-brand-warm/25"
                        : "bg-brand-teal/15 text-brand-teal-ink dark:text-brand-teal ring-brand-teal/25"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.2} />
                  </div>

                  {/* Значение и заголовок: строго центрированы */}
                  <div className="flex items-baseline justify-center gap-1 leading-tight">
                    {isNumeric ? (
                      <>
                        <span
                          className={cn(
                            "font-display font-extrabold text-base sm:text-lg lg:text-xl tabular-nums tracking-tight",
                            warm
                              ? "bg-brand-gradient-warm bg-clip-text text-transparent dark:text-brand-warm"
                              : "bg-brand-gradient-teal bg-clip-text text-transparent dark:text-brand-teal"
                          )}
                        >
                          {value}
                        </span>
                        {label && (
                          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/75 dark:text-foreground/85">
                            {label}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-display font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                          {value}
                        </span>
                        {label && (
                          <span
                            className={cn(
                              "text-[11px] sm:text-xs font-bold uppercase tracking-wider",
                              warm
                                ? "text-brand-warm-ink dark:text-brand-warm"
                                : "text-brand-teal-ink dark:text-brand-teal"
                            )}
                          >
                            {label}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Описание: центрировано, аккуратное и компактное */}
                  {desc && (
                    <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground dark:text-muted-foreground/90 font-medium leading-tight text-center max-w-[190px] truncate">
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

