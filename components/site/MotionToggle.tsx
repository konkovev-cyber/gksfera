"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { isMotionPaused, setMotionPaused, subscribeMotion } from "@/lib/motion";

/**
 * Кнопка «пауза анимаций» в шапке — единственный на весь сайт механизм
 * остановить движение (смена фото в герое, бегущая строка, «дыхание» кадра,
 * дрейф световых пятен). Нужна из-за WCAG 2.2.2: движущееся содержимое обязано
 * останавливаться по запросу. На сам кадр героя мы её не вешаем — кадр по
 * просьбе владельца остаётся без управления, а по G186 контрол имеет право
 * стоять в начале страницы и быть доступным с клавиатуры.
 */
export function MotionToggle() {
  const [paused, setPaused] = useState<boolean | null>(null);

  useEffect(() => {
    setPaused(isMotionPaused());
    return subscribeMotion(setPaused);
  }, []);

  const toggle = () => setMotionPaused(!(paused ?? false));

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center w-11 h-11 rounded-lg hover:bg-accent transition-colors text-foreground"
      aria-pressed={paused ?? false}
      aria-label={paused ? "Запустить анимации сайта" : "Остановить анимации сайта"}
      title={paused ? "Анимации остановлены — включить" : "Анимации идут — остановить"}
      data-motion-toggle
    >
      {paused === null ? (
        <span className="w-5 h-5" aria-hidden="true" />
      ) : paused ? (
        <Play className="w-5 h-5 fill-current" aria-hidden="true" />
      ) : (
        <Pause className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
}
