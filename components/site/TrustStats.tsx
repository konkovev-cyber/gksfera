"use client";

import {
  Award,
  CalendarCheck,
  Compass,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { cn } from "@/lib/utils";

/**
 * Блоки доверия — «стеклянные» карточки в два слоя света.
 *
 * Что здесь продумано:
 * 1. Иконка в цветном круге вместо прежней цветной планки на верхней грани:
 *    прямая линия сверху резала карточку пополам и спорила с круглой темой
 *    «сферы». Круг плюс мягкое пятно внутри дают тот же акцент без геометрии
 *    «таблички».
 * 2. Иконка подбирается по смыслу текста (возраст → люди, опыт → награда,
 *    группа → рукопожатие, адрес → пинов), а не по чётности индекса — ряд
 *    читается как четыре разных факта, а не как четыре копии.
 * 3. Объём: .glass (молочное стекло + blur + светлая кромка) поверх двухслойной
 *    тени. В тёмной теме тот же .glass даёт тонкую светлую плёнку и внутренний
 *    блик по верхнему краю — карточка поднимается над графитом.
 * 4. Ховер: подъём на 5px, тень удлиняется и теплеет, цифра «дозаряжается».
 *    В светлой теме яркость на ховере уходит вниз (текст становится темнее и
 *    контрастнее), в тёмной — вверх с неоновым свечением: «ярче» глазами в
 *    обеих темах, но WCAG AA не ломается ни в одной.
 * 5. Градиентный текст цифр остался, но градиент собран из «чернильных» тонов
 *    (5.1–5.9:1 на белом) и имеет solid-запас для печати.
 */
type Stat = { value?: string; label?: string; description?: string };

/** Порядок правил важен: первое совпадение выигрывает. */
const ICON_RULES: [RegExp, LucideIcon][] = [
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

const FALLBACK_ICONS: LucideIcon[] = [Sparkles, Award, Users, MapPin];

function pickStatIcon(stat: Stat, index: number): LucideIcon {
  const hay = `${stat.value ?? ""} ${stat.label ?? ""} ${stat.description ?? ""}`;
  for (const [re, icon] of ICON_RULES) if (re.test(hay)) return icon;
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

export function TrustStats() {
  const content = useContent();
  const stats: Stat[] = content.trustStats ?? [];
  const motto = content.studioMotto ?? "";

  return (
    <section id="truststats" className="px-4 pt-4 sm:pt-6 md:pt-8 pb-16 sm:px-6 md:pb-24 lg:px-8 relative overflow-hidden">
      {/* Световые пятна за карточками — глубина фона. Без них ряд лежал на
          плоском цвете, и стеклу не за что было «зацепить» взгляд. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-6 h-72 w-72 rounded-full bg-brand-warm/12 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-4 h-80 w-80 rounded-full bg-brand-teal/12 blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2 sm:mb-3 text-center">
            Почему родители выбирают нас
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance max-w-3xl mx-auto leading-[1.12] text-center">
            Коротко, по делу
          </h2>
        </Reveal>

        <Stagger className="mt-8 sm:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {stats.map((s, i) => {
            // Чередование акцентов: тёплый/холодный, чтобы ряд не выглядел
            // четырьмя копипастами
            const warm = i % 2 === 0;
            const value = String(s.value ?? "").trim();
            const label = String(s.label ?? "").trim();
            const desc = String(s.description ?? "").trim();
            const numeric = /^\d/.test(value);
            const Icon = pickStatIcon(s, i);

            return (
              <StaggerItem key={`${value}-${label}`} className="h-full">
                <div
                  data-stat-card
                  className={cn(
                    "glass group relative flex h-full min-h-[188px] sm:min-h-[212px] flex-col items-center justify-center",
                    "overflow-hidden rounded-3xl px-3.5 py-6 sm:px-5 text-center",
                    "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                    "hover:-translate-y-[5px] hover:border-brand-warm/45",
                    warm
                      ? "hover:shadow-[0_34px_60px_-28px_hsl(var(--shadow-tint-warm)/0.5),0_6px_16px_-8px_hsl(var(--shadow-hue)/0.2)]"
                      : "hover:shadow-[0_34px_60px_-28px_hsl(var(--shadow-tint-teal)/0.5),0_6px_16px_-8px_hsl(var(--shadow-hue)/0.2)]",
                  )}
                >
                  {/* Абстрактные градиентные пятна внутри карточки */}
                  <span
                    aria-hidden
                    className={cn(
                      "blob-drift pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full blur-3xl opacity-70",
                      warm ? "bg-brand-warm/25" : "bg-brand-teal/25",
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full blur-3xl opacity-50",
                      warm ? "bg-brand-teal/18" : "bg-brand-warm/18",
                    )}
                  />

                  {/* Иконка в цветном круге — вместо прежней планки на грани */}
                  <span
                    aria-hidden
                    className={cn(
                      "relative grid place-items-center w-12 h-12 rounded-full ring-1",
                      "transition-[transform,box-shadow] duration-300 group-hover:scale-[1.07]",
                      warm
                        ? "bg-brand-warm/12 text-brand-warm-ink ring-brand-warm/25 group-hover:shadow-[0_0_26px_-6px_hsl(var(--brand-warm)/0.7)]"
                        : "bg-brand-teal/12 text-brand-teal-ink ring-brand-teal/25 group-hover:shadow-[0_0_26px_-6px_hsl(var(--brand-teal)/0.7)]",
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.1} />
                  </span>

                  <p className="relative mt-4 font-display font-extrabold leading-[0.98] tracking-tight text-balance">
                    {numeric ? (
                      <>
                        <span
                          className={cn(
                            "text-[2.5rem] sm:text-[3rem] tabular-nums",
                            // Один цвет на экран: transparent под градиент-клип,
                            // печать возвращает solid (фоны при печати выключены).
                            "bg-clip-text text-transparent print:bg-none",
                            warm ? "bg-brand-gradient-warm" : "bg-brand-gradient-teal",
                            warm ? "print:text-brand-warm-ink" : "print:text-brand-teal-ink",
                            // «Дозарядка» цифры на ховере: в светлой теме вниз по
                            // яркости (становится контрастнее), в тёмной — вверх
                            // и со свечением.
                            "transition duration-300 group-hover:brightness-90",
                            "dark:group-hover:brightness-125 dark:group-hover:[text-shadow:0_0_26px_hsl(var(--brand-warm)/0.55)]",
                          )}
                        >
                          {value}
                        </span>
                        {label && (
                          <span className="ml-1.5 align-baseline text-base sm:text-xl font-bold text-foreground/70">
                            {label}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-[1.4rem] sm:text-[1.75rem] text-foreground transition duration-300 group-hover:brightness-90 dark:group-hover:brightness-110">
                          {value}
                        </span>
                        {label && (
                          <span
                            className={cn(
                              "text-[1.4rem] sm:text-[1.75rem] transition duration-300",
                              warm ? "text-brand-warm-ink" : "text-brand-teal-ink",
                            )}
                          >
                            {" "}
                            {label}
                          </span>
                        )}
                      </>
                    )}
                  </p>

                  {desc && (
                    <p className="relative mt-3 w-full border-t border-hairline/70 pt-2.5 text-[13px] sm:text-sm leading-snug text-foreground/70">
                      {desc}
                    </p>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center max-w-2xl mx-auto text-base sm:text-lg text-foreground/70 italic leading-relaxed">
            {motto}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
