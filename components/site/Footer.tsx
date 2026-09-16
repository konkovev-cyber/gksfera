"use client";

import Link from "next/link";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import { useContent } from "./ContentContext";
import { LogoLockup } from "./LogoLockup";


export function Footer() {
  const content = useContent();
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer className="bg-scrim text-on-scrim pt-12 pb-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden max-w-full">
      {/* Декоративная сфера */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-on-scrim/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <svg
        className="absolute bottom-0 right-0 w-48 h-48 opacity-5"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      <div className="container-max relative z-10 overflow-hidden">
        {/* На телефонной ширине: логотип и «Разделы» — во всю ширину (список
            разделов внутри в две колонки), «Контакты» и «Документы» — рядом.
            Так подвал не растягивается в длинную колонку. */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
          {/* Логотип + слоган */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-3">
              <LogoLockup onDark />
            </div>
            <p className="text-sm text-on-scrim/70 leading-relaxed max-w-xs">
              {content.siteConfig.fullName}
            </p>
            <p className="mt-3 font-display font-semibold text-base text-brand-warm/90">
              {content.siteConfig.tagline}
            </p>
          </div>

          {/* Навигация */}
          <nav aria-label="Навигация в подвале" className="col-span-2 lg:col-span-1">
            <h3 className="font-display font-semibold text-sm text-on-scrim/90 uppercase tracking-wider mb-3">
              Разделы
            </h3>
            {/* Две колонки на узких экранах, одна — на десктопе. */}
            <ul className="grid grid-cols-2 gap-x-4 lg:grid-cols-1 lg:gap-x-0">
              {content.footerLinks.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href ?? "#"}
                    onClick={(e) => handleNavClick(e, item.href ?? "#")}
                    className="inline-flex items-center min-h-[40px] lg:min-h-[28px] text-sm text-on-scrim/60 hover:text-brand-warm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Контакты */}
          <div>
            <h3 className="font-display font-semibold text-sm text-on-scrim/90 uppercase tracking-wider mb-3">
              Контакты
            </h3>
            <ul className="space-y-0.5">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-warm flex-shrink-0" aria-hidden="true" />
                {/* Адрес набираем двумя осмысленными строками, а не как попало.
                    Раньше «{city}, {address}» в одном потоке давало вдов: на
                    1440px — «…Спортивный переулок, » / «13», на 390px — три
                    строки со «Спортивный» одной отдельной. Город и улица —
                    разные сущности, у каждой своя строка; balance добивает то,
                    что улица на узких экранах всё-таки переносится. */}
                <address className="not-italic text-sm leading-snug text-on-scrim/60">
                  <span className="block">{content.siteConfig.city}</span>
                  <span className="block text-balance">{content.siteConfig.address}</span>
                </address>
              </li>
              <li>
                <a
                  href={content.siteConfig.phoneHref}
                  className="inline-flex items-center gap-2.5 min-h-[40px] lg:min-h-[28px] text-sm text-on-scrim/60 hover:text-brand-warm transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-warm flex-shrink-0" />
                  {content.siteConfig.phone}
                </a>
              </li>
              {content.siteConfig.maxUrl && (
                <li>
                  <a
                    href={content.siteConfig.maxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 min-h-[40px] lg:min-h-[28px] text-sm text-on-scrim/60 hover:text-brand-teal transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    Написать в MAX
                  </a>
                </li>
              )}
              <li>
                <a
                  href={content.siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 min-h-[40px] lg:min-h-[28px] text-sm text-on-scrim/60 hover:text-brand-warm transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-brand-warm flex-shrink-0" />
                  {content.siteConfig.vkDisplay}
                </a>
              </li>
            </ul>
          </div>

          {/* Юридические ссылки */}
          <div>
            <h3 className="font-display font-semibold text-sm text-on-scrim/90 uppercase tracking-wider mb-3">
              Документы
            </h3>
            <ul>
              {content.footerLinks.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center min-h-[40px] lg:min-h-[28px] text-sm text-on-scrim/60 hover:text-brand-warm transition-colors break-words max-w-full"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя полоса */}
        <div className="mt-8 pt-5 border-t border-on-scrim/10">
          <p className="text-xs text-on-scrim/50 text-center break-words">
            © {new Date().getFullYear()} {content.siteConfig.fullName}. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
