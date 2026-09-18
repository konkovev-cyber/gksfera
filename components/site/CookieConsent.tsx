"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

/**
 * Баннер согласия на обработку cookies и персональных данных.
 *
 * Требуется:
 *  • 152-ФЗ «О персональных данных» — обработка возможна только при
 *    согласии субъекта (ст. 6, ч. 1, п. 1).
 *  • Позиция Яндекса (май 2023): Метрика не должна ставиться до явного
 *    согласия пользователя на использование файлов cookie / средств
 *    аналитики.
 *
 * При первом визите баннер блокирует отрисовку Метрики (решение
 * принимает layout.tsx, проверяя localStorage). При выборе «Не принимать»
 * Метрика не ставится, но сайт продолжает работать. При «Принять» —
 * Метрика активируется, а выбор сохраняется в localStorage на 1 год.
 *
 * Пользователь может отозвать согласие в любой момент, нажав «Настроить» —
 * это сбрасывает запись, и при следующем визите баннер появится снова.
 */

const STORAGE_KEY = "sfera_cookie_consent";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return setVisible(true);
      const { ts, accept } = JSON.parse(raw) as { ts: number; accept: boolean };
      // Если согласие дано давно (> 1 год), считаем его устаревшим и показываем
      // баннер заново. В РФ закон не устанавливает срок, но Яндекс требует
      // периодического подтверждения — год разумный минимум.
      if (Date.now() - ts > ONE_YEAR_MS) return setVisible(true);
      if (accept) document.documentElement.dataset.cookieConsent = "accepted";
    } catch {
      /* повреждённый ключ — показываем баннер */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), accept: true } satisfies { ts: number; accept: boolean })
      );
      document.documentElement.dataset.cookieConsent = "accepted";
    } catch {
      /* приватный режим — просто скрываем */
    }
    setVisible(false);
  };

  const reject = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), accept: false } satisfies { ts: number; accept: boolean })
      );
    } catch {
      /* приватный режим */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2"
      role="region"
      aria-label="Запрос согласия на cookies"
    >
      <div className="mx-auto max-w-3xl glass rounded-2xl border border-border/60 shadow-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 text-sm leading-relaxed text-foreground/80">
          <span className="font-semibold text-foreground">Согласие на cookies</span>
          {" — "}
          Мы используем файлы cookie и средства аналитики (Яндекс.Метрика), чтобы понимать,
          как вы пользуетесь сайтом, и делать его удобнее. Это не позволяет identiФИцировать
          вас лично, но помогает нам улучшать сервис. Подробнее — в{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-warm-ink underline decoration-brand-warm/40 hover:decoration-brand-warm"
          >
            политике конфиденциальности
          </Link>
          .
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={reject}
            className="h-10 px-4 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground border border-border hover:border-foreground/30 transition-colors"
          >
            Не принимать
          </button>
          <button
            onClick={accept}
            className="h-10 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Принять
          </button>
          <button
            onClick={() => setVisible(false)}
            className="ml-1 p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}