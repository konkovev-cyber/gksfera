"use client";

import { useContent } from "./ContentContext";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { cn } from "@/lib/utils";

/**
 * Блоки доверия. Что тут продумано:
 *
 * 1. value + label — это ОДНА фраза («15+ лет», «Небольшие группы»), а не две
 *    строки. Раньше они шли друг под другом, и карточка читалась как обрывок:
 *    «15+» / «лет». Числа набираем крупно с мелкой единицей на той же базовой
 *    линии, словесные пары — одним кеглем, второе слово акцентным цветом.
 * 2. Объём — за счёт трёх слоёв: мягкая длинная тень + короткая контактная
 *    тень (предмет не «висит в воздухе»), подсветка верха карточки и световое
 *    пятно под цифрой. На ховере карточка приподнимается, тень удлиняется.
 * 3. Градиентный текст цифр обязательно с печатью в запасе: при печати
 *    фоны выключаются, background-clip: text оставляет прозрачные буквы —
 *    поэтому print: возвращает solid-цвет.
 */
export function TrustStats() {
  const content = useContent();
  const stats = content.trustStats ?? [];
  const motto = content.studioMotto ?? "";

  return (
    <section className="section-padding relative overflow-hidden bg-brand-cream/40">
      {/* Световые пятна за карточками — глубина фона, сами по себе не мешают */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-6 h-64 w-64 rounded-full bg-brand-warm/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-teal/10 blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3 text-center">
            Почему родители выбирают нас
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance max-w-3xl mx-auto leading-[1.15] text-center">
            Коротко, по делу
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {stats.map((s, i) => {
            // Чередование акцентов: ряд не выглядит четырьмя копипастами
            const warm = i % 2 === 0;
            const value = String(s.value ?? "").trim();
            const label = String(s.label ?? "").trim();
            const desc = String(s.description ?? "").trim();
            const numeric = /^\d/.test(value);

            return (
              <StaggerItem key={`${value}-${label}`} className="h-full">
                <div
                  className={cn(
                    "group relative flex h-full min-h-[152px] sm:min-h-[176px] flex-col items-center justify-center",
                    "overflow-hidden rounded-3xl px-3.5 py-5 sm:px-5 text-center",
                    // Карточка «освещена сверху»: белый верх → тёплый низ
                    "bg-gradient-to-b from-white via-card to-brand-cream/50",
                    "border border-border/50",
                    // Двухслойная тень: длинная + контактная. Без неё плашка
                    // оставалась белым прямоугольником на кремовом фоне.
                    "shadow-[0_16px_32px_-22px_rgba(31,41,55,0.30),0_2px_6px_-2px_rgba(31,41,55,0.12)]",
                    "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                    "hover:-translate-y-1 hover:border-brand-warm/30",
                    "hover:shadow-[0_30px_56px_-26px_rgba(31,41,55,0.38),0_4px_12px_-4px_rgba(31,41,55,0.16)]",
                  )}
                >
                  {/* Тонкий акцент на верхней грани — читается как «толщина» */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-1/2 top-0 h-[3px] w-10 -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-24",
                      warm
                        ? "bg-gradient-to-r from-brand-warm to-brand-warm/20"
                        : "bg-gradient-to-r from-brand-teal to-brand-teal/20",
                    )}
                  />
                  {/* Пятно света под цифрой */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125",
                      warm ? "bg-brand-warm/20" : "bg-brand-teal/20",
                    )}
                  />

                  <p className="relative font-display font-extrabold leading-[0.98] tracking-tight text-balance">
                    {numeric ? (
                      <>
                        <span
                          className={cn(
                            "text-[2.35rem] sm:text-[2.9rem] tabular-nums",
                            // Один цвет на экран (transparent под градиент-клип),
                            // печать возвращает solid — два color-utility в одном
                            // классе давать нельзя, победит порядок в CSS.
                            "bg-clip-text text-transparent print:bg-none",
                            warm ? "bg-brand-warm print:text-brand-warm" : "bg-brand-teal print:text-brand-teal",
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
                        <span className="text-[1.35rem] sm:text-[1.7rem] text-foreground">{value}</span>
                        {label && (
                          <span
                            className={cn(
                              "text-[1.35rem] sm:text-[1.7rem]",
                              warm ? "text-brand-warm" : "text-brand-teal",
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
                    <p className="relative mt-3 w-full border-t border-border/45 pt-2.5 text-[13px] sm:text-sm leading-snug text-muted-foreground">
                      {desc}
                    </p>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground italic leading-relaxed">
            {motto}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
