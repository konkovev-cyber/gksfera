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
  // «Уменьшить движение» не должно лишать контента: под этим флагом гаснем
  // перелистывание без затухания (см. transition у кадра) и наклоны, но само
  // фото обязано меняться — иначе герой показывает один снимок вместо альбома.
  // Остановить совсем можно кнопкой в ленте точек (WCAG 2.2.2).
  const [photosPaused, setPhotosPaused] = useState(false);
  useEffect(() => {
    if (heroImages.length <= 1 || photosPaused) return;
    const id = window.setInterval(
      () => setActiveImg((i) => (i + 1) % heroImages.length),
      7000, // смена раз в 7 секунд — не слишком часто
    );
    return () => window.clearInterval(id);
    // activeImg в зависимостях: ручной клик по точке перезапускает таймер,
    // чтобы авто-смена не «догоняла» через долю секунды после выбора вручную.
  }, [heroImages.length, activeImg, photosPaused]);
  // Защита от выхода за границы после изменения набора в админке
  const safeIdx = heroImages.length > 0 ? activeImg % heroImages.length : 0;

  /**
   * Соотношения сторон реально загруженных фото. Рамка hero подстраивается под
   * отношение текущего снимка: раньше жёсткий 4:5 отрезал 35% ширины альбомного
   * фото (по краям как раз дети), а на xl — 19%. Кламп не даёт экстремальным
   * панорамам и портретам раскачивать вёрстку.
   */
  const [photoRatios, setPhotoRatios] = useState<Record<string, number>>({});
  const noteRatio = (src: string, el: HTMLImageElement | null) => {
    if (!el?.naturalWidth || !el?.naturalHeight) return;
    const r = el.naturalWidth / el.naturalHeight;
    setPhotoRatios((prev) => (prev[src] && Math.abs(prev[src] - r) < 0.01 ? prev : { ...prev, [src]: r }));
  };
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  // Диапазон 0.85…1.5: между стартовым 4:5 и типовым 5:4 — так обрезка сходится
  // к нулю, но рамка остаётся в пределах макета на любом фото из админки.
  const frameRatio = clamp(photoRatios[heroImages[safeIdx]] ?? 1.25, 0.85, 1.5);

  return (
    <section
      className="relative py-20 md:py-28 lg:py-32 pt-24 md:pt-32 overflow-hidden mesh-hero"
      onMouseMove={(e) => {
        if (!fineMotion) return;
        const r = e.currentTarget.getBoundingClientRect();
        sx.set(e.clientX - r.left);
        sy.set(e.clientY - r.top);
      }}
    >
      {/* Mesh-градиент: четыре радиальных пятна (два тёплых, два бирюзовых)
          заданы слоем .mesh-hero на самой секции — они не двигаются и потому
          не «плывут» при скролле. Поверх них — три медленных пятных круга
          ниже, они и дают живость. */}
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

      {/* Текстура шума. В светлой теме домножаем (заметно на кремовом),
          в тёмной — overlay: multiply по графиту невидим и только глушит. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-overlay"
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
              data-hero-badge
              className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full ring-1 ring-brand-warm/20 text-foreground text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4 text-brand-warm-ink" aria-hidden="true" />
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
              className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3"
            >
              <button
                onClick={() => scrollTo("#tasks")}
                className="btn-cta group h-12 sm:h-13 px-7 font-semibold text-base"
              >
                {content.heroContent.primaryCta}
                <ArrowRight className="btn-arrow w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTo("#programs")}
                className="btn-outline h-12 sm:h-13 px-7 font-semibold text-base"
              >
                {content.heroContent.secondaryCta}
              </button>
            </motion.div>

            {/* Промо-лента («Расписание / Пробное / Направления») — настраивается
                в админке. Отдельную строку «5–15 лет · небольшие группы · …»
                убрали: те же факты уже читаются в ленте и на карточках фото. */}
            <HeroBanners />
          </motion.div>

          {/* Изображение с 3D-наклоном */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={onTiltMove}
            onMouseLeave={onTiltLeave}
            style={{
              aspectRatio: String(frameRatio),
              ...(fineMotion ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1200 } : null),
            }}
            className="relative aspect-[5/4] will-change-transform [transform-style:preserve-3d] transition-[aspect-ratio] duration-700 ease-out"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-hairline/60 bg-muted" data-hero-rotate>
              {/* Ротация фото: кроссфейд + очень медленное «дыхание» кадра. */}
              <AnimatePresence>
                {heroImages.map((src, i) =>
                  i === safeIdx ? (
                    <motion.div
                      key={src + "-" + i}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      /* Под «уменьшить движение» кадр меняется мгновенно:
                         меняется содержимое, а не положение в пространстве. */
                      transition={{ duration: fineMotion ? 1.4 : 0, ease: "easeInOut" }}
                    >
                      {/* «Дыхание» кадра — CSS-анимация (hero-breathe), а не
                          framer: на keyframes с repeat: Infinity framer доходил
                          до 1.05 и останавливался. Плюс режим «уменьшить
                          движение» выключает эффект средствами CSS — без
                          расхождения SSR и клиента. */}
                      <div className="absolute inset-0 hero-breathe">
                        <Image
                          src={src}
                          alt={content.heroContent.imageAlt}
                          fill
                          priority={i === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          onLoad={(e) => noteRatio(src, e.currentTarget)}
                        />
                      </div>
                    </motion.div>
                  ) : null,
                )}
              </AnimatePresence>
              {/* Блик-градиент поверх фото */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/15 via-transparent to-brand-warm/10 mix-blend-overlay pointer-events-none" />

              {/* Индикатор ротации — в стеклянной капсуле: на светлых участках
                  кадра голые точки терялись. Неактивные полупрозрачные,
                  активная шире и на всю плотность. Снизу по центру: углы кадра
                  занимают карточки-факта. */}
              {heroImages.length > 1 && (
                <div className="absolute top-3 left-3 z-10 sm:top-auto sm:bottom-3 sm:left-1/2 sm:-translate-x-1/2">
                  <div className="glass-frost flex items-center gap-1.5 rounded-full px-3 py-2">
                    {heroImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        aria-label={`Показать фото ${i + 1}`}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i === safeIdx ? "w-5 bg-frost-ink" : "w-1.5 bg-frost-ink/40 hover:bg-frost-ink/70",
                        )}
                      />
                    ))}
                    <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-frost-ink/20" />
                    {/* Авто-листалка крутится всем, значит по WCAG 2.2.2 её надо
                        уметь остановить: точки выбирают кадр, кнопка — выключает
                        саму смену. */}
                    <button
                      type="button"
                      onClick={() => setPhotosPaused((v) => !v)}
                      aria-pressed={photosPaused}
                      aria-label={photosPaused ? "Запустить смену фото" : "Остановить смену фото"}
                      title={photosPaused ? "Запустить смену фото" : "Остановить смену фото"}
                      className="chip-on-frost flex h-6 w-6 items-center justify-center rounded-full"
                    >
                      {photosPaused ? (
                        <Play className="h-3 w-3 fill-current" />
                      ) : (
                        <Pause className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -inset-3 rounded-[2rem] border-2 border-brand-warm/20 -z-10 hidden sm:block" />
            {/* Две карточки-факта по углам кадра. Размещение то же, что было,
                но подложки light: справа-сверху матовое стекло (variant
                "frost"), слева-снизу белая пилюля в фирменном тёплом контуре
                ("pill") — она перекликается с бейджем над заголовком. Подпись
                «Дошкольники и школьники» с плашки убрана: возраст 5–15 лет
                указан и в карточках направлений, а в тесной пилюле он только
                мешал.
                style с x/y/z применяется только при fineMotion: при
                «уменьшить движение» кадр стоит ровно, и трогать его нечем. */}
            <CornerCard
              tone="warm"
              variant="pill"
              label="Возраст детей"
              value="5–15 лет"
              delay={0.7}
              className="-bottom-4 left-0 sm:-bottom-6 sm:-left-6"
              style={fineMotion ? { x: warmX, y: warmY, z: 46 } : undefined}
            />
            <CornerCard
              tone="teal"
              variant="frost"
              label="Опыт работы"
              value="более 15 лет"
              delay={0.85}
              className="-top-3 right-0 sm:-top-5 sm:-right-5"
              style={fineMotion ? { x: tealX, y: tealY, z: 62 } : undefined}
            />
          </motion.div>
        </div>
      </div>

      {/* Бегущая строка направлений */}
      {/* Бегущая строка направлений — без рамки. Раньше под ней висела полоса
          (две линии-градиента, подложка from-brand-warm/5 via-card и внутренние
          тени) — получался «конверт». Теперь бегёт только текст, а по краям
          он растворяется маскированием (.fade-edges: linear-gradient mask),
          поэтому косынка-градиент справа больше не нужен. */}
      <div className="mt-12 md:mt-14 relative z-10">
        <div className="relative py-6 overflow-hidden fade-edges">
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
                    <span className="text-sm sm:text-base font-display font-bold uppercase tracking-wide text-brand-warm-ink dark:[text-shadow:0_0_20px_hsl(var(--brand-warm)/0.45)]">
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
        </div>

        {/* Пауза/пуск. WCAG 2.2.2: у бесконечной ленты обязан быть выключатель,
            поэтому кнопку оставляем — но без рамок и подложек-полос. */}
        <button
          type="button"
          onClick={() => setMarqueePaused((v) => !v)}
          aria-pressed={marqueePaused}
          aria-label={marqueePaused ? "Запустить бегущую строку" : "Остановить бегущую строку"}
          title={marqueePaused ? "Запустить бегущую строку" : "Остановить бегущую строку"}
          className="glass absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full text-muted-foreground hover:text-brand-warm-ink transition-colors flex items-center justify-center"
        >
          {marqueePaused ? (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </button>
      </div>
    </section>
  );
}
