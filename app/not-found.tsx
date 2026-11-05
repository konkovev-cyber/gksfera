import Link from "next/link";
import { MessageCircle, Phone, Home } from "lucide-react";
// Контакты берём из статических дефолтов, а не из Supabase: страница 404 может
// открыться и тогда, когда база недоступна, — и ей всё ещё есть куда предложить
// написать.
import { siteConfig } from "@/data/site";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-md w-full text-center">
        {/* Водяной знак крупным кеглем */}
        <p className="font-display font-extrabold text-[64px] sm:text-[76px] leading-none text-foreground/40 select-none">
          404
        </p>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground mt-2 text-balance">
          Такой страницы нет
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
          Возможно, ссылка устарела или в адресе опечатка. Напишите или позвоните нам — подскажем и запишем на занятие.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
          {siteConfig.maxUrl && (
            <a
              href={siteConfig.maxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta h-12 px-6 font-semibold text-sm inline-flex items-center justify-center gap-2 rounded-xl shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Написать в MAX</span>
            </a>
          )}
          <a
            href={siteConfig.phoneHref}
            className="btn-outline h-12 px-6 font-semibold text-sm inline-flex items-center justify-center gap-2 rounded-xl transition-all tabular-nums"
          >
            <Phone className="w-4 h-4 text-brand-warm-ink" />
            <span>{siteConfig.phone}</span>
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-lg hover:bg-accent/40"
          >
            <Home className="w-4 h-4 text-primary" />
            <span className="font-medium">На главную</span>
          </Link>
          {siteConfig.vkUrl && (
            <>
              <span className="text-border hidden sm:inline" aria-hidden="true">•</span>
              <a
                href={siteConfig.vkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-lg hover:bg-accent/40 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brand-teal" />
                <span>{siteConfig.vkDisplay}</span>
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
