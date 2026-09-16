"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

/**
 * Граница ошибки для всей маршрутной зоны. Без неё любая серверная ошибка
 * показывала системную страницу Next — чужую по стилю и без единого выхода.
 *
 * Контакт (телефон/MAX) здесь обязателен: если форма упала, у родителя должен
 * остаться способ записаться, а не только кнопка «повторить».
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // digest — это отсылка к серверному логу Vercel, в браузере текста стектрейса нет.
    trackEvent("form_error", { reason: "route_error", digest: error.digest ?? "" });
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
          Что-то пошло не так
        </h1>
        <p className="text-foreground/70 mt-3 leading-relaxed">
          Страница не смогла загрузиться. Попробуйте обновить — если не поможет, напишите или
          позвоните нам, мы всё равно вас запишем.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-cta h-12 px-5 font-semibold text-sm inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
          {siteConfig.maxUrl && (
            <a
              href={siteConfig.maxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline h-12 px-5 font-semibold text-sm inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Написать в MAX
            </a>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors min-h-[44px] inline-flex items-center gap-2">
            <Home className="w-4 h-4" /> На главную
          </Link>
          <a href={siteConfig.phoneHref} className="text-foreground/70 hover:text-foreground transition-colors min-h-[44px] tabular-nums">
            {siteConfig.phone}
          </a>
        </div>
      </div>
    </main>
  );
}
