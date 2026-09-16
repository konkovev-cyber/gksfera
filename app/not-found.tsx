import Link from "next/link";
import { MessageCircle, Phone, MapPin } from "lucide-react";
// Контакты берём из статических дефолтов, а не из Supabase: страница 404 может
// открыться и тогда, когда база недоступна, — и ей всё ещё есть куда предложить
// написать.
import { siteConfig } from "@/data/site";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center">
        {/* Водяной знак крупным кеглем — по правилам AA ему нужно 3:1, поэтому
            opacity не декоративные 15%: 45% давали 2.81:1, 55% закрывают порог. */}
        <p className="font-display font-extrabold text-[64px] leading-none text-foreground/55 select-none">404</p>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground mt-2">
          Такой страницы нет
        </h1>
        <p className="text-foreground/70 mt-3 leading-relaxed">
          Возможно, ссылка устарела или в адресе опечатка. Напишите нам — подскажем, где лежит
          нужное, и запишем на занятие.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {siteConfig.maxUrl && (
            <a
              href={siteConfig.maxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta h-12 px-5 font-semibold text-sm inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Написать в MAX
            </a>
          )}
          <a
            href={siteConfig.phoneHref}
            className="btn-outline h-12 px-5 font-semibold text-sm inline-flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {siteConfig.phone}
          </a>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors min-h-[44px]">
            <MapPin className="w-4 h-4" /> На главную
          </Link>
          <a
            href={siteConfig.vkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4" /> {siteConfig.vkDisplay}
          </a>
        </div>
      </div>
    </main>
  );
}
