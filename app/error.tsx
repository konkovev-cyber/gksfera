"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, MessageCircle, Phone, AlertCircle } from "lucide-react";
import { siteConfig } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

/**
 * Граница ошибки для всей маршрутной зоны. Без неё любая серверная ошибка
 * показывала системную страницу Next — чужую по стилю и без единого выхода.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackEvent("form_error", { reason: "route_error", digest: error.digest ?? "" });
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-warm/15 text-brand-warm-ink flex items-center justify-center mx-auto mb-5 shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground text-balance">
          Что-то пошло не так
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
          Страница не смогла загрузиться. Попробуйте обновить — если не поможет, напишите или
          позвоните нам, мы всё равно вас запишем.
        </p>

        {/* Основные кнопки действий — строго по центру, одинакового размера */}
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
          <button
            type="button"
            onClick={reset}
            className="btn-cta h-12 px-6 font-semibold text-sm inline-flex items-center justify-center gap-2 rounded-xl shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Обновить</span>
          </button>
          {siteConfig.maxUrl && (
            <a
              href={siteConfig.maxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline h-12 px-6 font-semibold text-sm inline-flex items-center justify-center gap-2 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4 text-brand-teal" />
              <span>Написать в MAX</span>
            </a>
          )}
        </div>

        {/* Нижняя строка ссылок — строго на одной горизонтальной линии с иконками */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-lg hover:bg-accent/40"
          >
            <Home className="w-4 h-4 text-primary" />
            <span className="font-medium">На главную</span>
          </Link>

          <span className="text-border hidden sm:inline" aria-hidden="true">•</span>

          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-lg hover:bg-accent/40 tabular-nums font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-brand-warm-ink" />
            <span>{siteConfig.phone}</span>
          </a>
        </div>
      </div>
    </main>
  );
}
