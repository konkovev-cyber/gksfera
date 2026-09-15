"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useContent } from "./ContentContext";
import { cn } from "@/lib/utils";

/**
 * ВРЕМЕННАЯ страница-лаборатория: четыре ленты-кандидата друг под другом,
 * чтобы выбрать глазами, а не по описанию. Открыть /design/marquee-lab.
 * После выбора победитель переезжает в Hero.tsx, остальное удаляется вместе
 * с этим файлом, маршрутом и блоком .belt-* в globals.css.
 *
 * Общая механика всех кандидатов (кроме «Было»): два ряда едут НАВСТРЕЧУ друг
 * другу с разной скоростью, вся лента наклоняется вслед за курсором.
 */

/** Гидрация-безопасно: движение включаем только когда его не просят убирать. */
function useFineMotion() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference)");
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return fine;
}

/** Разделитель между пунктами ряда — тоже часть характера ленты. */
function Sep({ kind }: { kind: "dots" | "rule" | "diamond" }) {
  if (kind === "rule") {
    return (
      <span className="mx-5 sm:mx-7 inline-block w-8 h-px bg-current opacity-25 shrink-0" aria-hidden="true" />
    );
  }
  if (kind === "diamond") {
    return (
      <span className="mx-5 sm:mx-6 inline-block w-1.5 h-1.5 rotate-45 border border-current opacity-35 shrink-0" aria-hidden="true" />
    );
  }
  return (
    <span className="mx-5 sm:mx-7 flex items-center gap-1 shrink-0" aria-hidden="true">
      <span className="w-1 h-1 rounded-full bg-brand-teal" />
      <span className="w-1.5 h-1.5 rounded-full bg-brand-warm" />
      <span className="w-1 h-1 rounded-full bg-brand-teal" />
    </span>
  );
}

/**
 * Один бегущий ряд. Трек = список, продублированный дважды, и смещение на
 * -50%: так цикл бесшовный. Скорость и направление — через переменные.
 */
function Row({
  items,
  dur,
  reverse,
  sep,
  className,
  moving,
}: {
  items: string[];
  dur: number;
  reverse?: boolean;
  sep: "dots" | "rule" | "diamond";
  className: string;
  moving: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className="relative py-2 overflow-hidden fade-edges">
      <div
        className={cn("flex w-max belt", reverse && "belt-rev", !moving && "belt-paused")}
        style={{ "--belt-dur": `${dur}s` } as CSSProperties}
      >
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className={className}>{t}</span>
            <Sep kind={sep} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Кнопка паузы — обязательна: у бесконечной ленты должен быть выключатель. */
function PauseBtn({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={paused ? "Запустить ленту" : "Остановить ленту"}
      title={paused ? "Запустить ленту" : "Остановить ленту"}
      className="glass absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full text-muted-foreground hover:text-brand-warm-ink transition-colors flex items-center justify-center"
    >
      {paused ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : <Pause className="w-4 h-4" />}
    </button>
  );
}

/** Лента, наклоняющаяся за курсором. Угол и перспектива — настраиваемые. */
function Tilt({
  tilt,
  perspective,
  baseRotate = 0,
  zRows,
  children,
}: {
  tilt: number;
  perspective: number;
  baseRotate?: number;
  zRows?: [number, number];
  children: (args: { onMove: (e: React.MouseEvent<HTMLDivElement>) => void; onLeave: () => void; styleRow: (i: number) => CSSProperties }) => React.ReactNode;
}) {
  const fine = useFineMotion();
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotX = useSpring(useTransform(ty, [-0.5, 0.5], [tilt, -tilt]), { stiffness: 170, damping: 21 });
  const rotY = useSpring(useTransform(tx, [-0.5, 0.5], [-tilt, tilt]), { stiffness: 170, damping: 21 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!fine) return;
    const r = e.currentTarget.getBoundingClientRect();
    tx.set((e.clientX - r.left) / r.width - 0.5);
    ty.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    tx.set(0);
    ty.set(0);
  };
  // Ряды разводятся по глубине: передний ближе и крупнее, задний — дальше.
  const styleRow = (i: number): CSSProperties =>
    fine && zRows ? { transform: `translateZ(${zRows[i === 0 ? 0 : 1]}px)` } : {};

  return (
    <div
      style={baseRotate ? { transform: `rotate(${baseRotate}deg)` } : undefined}
      className={baseRotate ? "w-[112%] -ml-[6%]" : undefined}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={
          fine
            ? { transformPerspective: perspective, rotateX: rotX, rotateY: rotY }
            : undefined
        }
        className="will-change-transform [transform-style:preserve-3d]"
        data-belt-tilt
      >
        {children({ onMove, onLeave, styleRow })}
      </motion.div>
    </div>
  );
}

function VariantBlock({
  code,
  title,
  note,
  children,
}: {
  code: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative border-t border-border pt-10">
      <p className="container-max text-xs uppercase tracking-[0.2em] text-muted-foreground">
        вариант {code} · <span className="font-semibold text-foreground">{title}</span>
      </p>
      <p className="container-max mt-1 max-w-2xl text-sm text-muted-foreground">{note}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function MarqueeLab() {
  // useContent отдаёт сам объект контента (как в Hero и Footer), не обёртку.
  const content = useContent();
  const fine = useFineMotion();
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setPaused((p) => ({ ...p, [k]: !p[k] }));

  const names = content.programs.map((p) => p.title);
  const ages = content.programs.map((p) => p.ageRange);
  const tagline = content.siteConfig.tagline;
  const city = content.siteConfig.city;

  return (
    <div className="pb-24">
      <VariantBlock
        code="0"
        title="Было — один ряд, монотонно"
        note="Текущая лента в герое для сравнения: один ряд, 36s линейно, вертикальная «волна» на каждом пункте. Ритма и иерархии нет — отсюда скука."
      >
        <div className="relative">
          <div className="py-6 overflow-hidden fade-edges">
            <div className={cn("flex w-max animate-marquee", paused["0"] && "marquee-paused")}>
              {[...names, ...names].map((t, i) => (
                <span
                  key={i}
                  className={cn("flex items-center whitespace-nowrap", fine && "marquee-wave")}
                  style={{ animationDelay: `${-((i % (names.length || 1)) / (names.length || 1)) * 7}s` }}
                >
                  <span className="text-sm sm:text-base font-display font-bold uppercase tracking-wide text-brand-warm-ink">
                    {t}
                  </span>
                  <Sep kind="dots" />
                </span>
              ))}
            </div>
          </div>
          <PauseBtn paused={!!paused["0"]} onToggle={() => toggle("0")} />
        </div>
      </VariantBlock>

      <VariantBlock
        code="A"
        title="Названия / возрасты, встречно"
        note="Верхний ряд — названия программ как сейчас, нижний — возраст каждой группы, и он едет НАВСТРЕЧУ медленнее (47s против 36s): картина не повторяется, пока два ряда не совпадут. Наклон мягкий, ±5°."
      >
        <Tilt tilt={5} perspective={900}>
          {({ onMove, onLeave, styleRow }) => (
            <div onMouseMove={onMove} onMouseLeave={onLeave} className="relative">
              <div style={styleRow(0)}>
                <Row
                  items={names}
                  dur={36}
                  sep="dots"
                  moving={!paused.A}
                  className="text-sm sm:text-base font-display font-bold uppercase tracking-wide text-brand-warm-ink"
                />
              </div>
              <div style={styleRow(1)}>
                <Row
                  items={ages}
                  dur={47}
                  reverse
                  sep="rule"
                  moving={!paused.A}
                  className="text-xs sm:text-sm uppercase tracking-[0.16em] text-brand-teal-ink"
                />
              </div>
              <PauseBtn paused={!!paused.A} onToggle={() => toggle("A")} />
            </div>
          )}
        </Tilt>
      </VariantBlock>

      <VariantBlock
        code="B"
        title="Контраст кеглей + глубина"
        note="Тот же приём, но рядом играет размер: названия крупно (28–36px), служебный ряд мелко и с широким разрядником. Ряды разведены по Z (ближний +44px, дальний −26px) и Perspective 700 — наклон за курсором читается как объём, а не как поворот плашки."
      >
        <Tilt tilt={8} perspective={700} zRows={[44, -26]}>
          {({ onMove, onLeave, styleRow }) => (
            <div onMouseMove={onMove} onMouseLeave={onLeave} className="relative py-3">
              <div style={styleRow(0)}>
                <Row
                  items={names}
                  dur={34}
                  sep="diamond"
                  moving={!paused.B}
                  className="text-xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-foreground"
                />
              </div>
              <div style={styleRow(1)} className="-mt-1">
                <Row
                  items={ages.map((a, i) => `${a} · ${names[i] ? content.programs[i].category === "educational" ? "развитие" : "творчество" : ""}`.trim())}
                  dur={52}
                  reverse
                  sep="rule"
                  moving={!paused.B}
                  className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-muted-foreground"
                />
              </div>
              <PauseBtn paused={!!paused.B} onToggle={() => toggle("B")} />
            </div>
          )}
        </Tilt>
      </VariantBlock>

      <VariantBlock
        code="C"
        title="Лента под углом сквозь экран"
        note="Два встречных ряда повёрнуты на −1.6° и выходят за поля контейнера: полоса режет первый экран по диагонали, как в редакционной вёрстке. Курсор добавляет к этому статичному наклону ещё ±3°. Слоган и город идут отдельным, третьим рядом — так лента несёт не только названия."
      >
        <Tilt tilt={3} perspective={1100} baseRotate={-1.6} zRows={[30, -18]}>
          {({ onMove, onLeave, styleRow }) => (
            <div onMouseMove={onMove} onMouseLeave={onLeave} className="relative py-4">
              <div style={styleRow(0)}>
                <Row
                  items={names}
                  dur={31}
                  sep="dots"
                  moving={!paused.C}
                  className="text-base sm:text-xl font-display font-extrabold uppercase tracking-wide text-brand-warm-ink"
                />
              </div>
              <div style={styleRow(1)}>
                <Row
                  items={ages}
                  dur={44}
                  reverse
                  sep="rule"
                  moving={!paused.C}
                  className="text-xs sm:text-sm uppercase tracking-[0.2em] text-brand-teal-ink"
                />
              </div>
              {/* Подчинённость третьего ряда держится кеглем и разрядником, а
                  не прозрачностью: opacity-70 сверху кладёт 3.00:1 вместо AA. */}
              <div>
                <Row
                  items={[tagline, `${city} · набор открыт`, "пробное занятие бесплатно"]}
                  dur={58}
                  sep="diamond"
                  moving={!paused.C}
                  className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground"
                />
              </div>
              <PauseBtn paused={!!paused.C} onToggle={() => toggle("C")} />
            </div>
          )}
        </Tilt>
      </VariantBlock>
    </div>
  );
}
