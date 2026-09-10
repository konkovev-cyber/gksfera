"use client";

import Link from "next/link";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import { siteConfig, footerLinks } from "@/data/site";

export function Footer() {
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
    <footer className="bg-foreground text-background pt-16 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Декоративная сфера */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/3 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <svg
        className="absolute bottom-0 right-0 w-48 h-48 opacity-5"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="0.5" />
      </svg>

      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Логотип + слоган */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <FooterLogo />
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold text-xl tracking-tight text-background">
                  СФЕРА
                </span>
                <span className="text-[10px] text-background/60 mt-0.5 font-medium">
                  Студия · Горячий Ключ
                </span>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed max-w-xs">
              {siteConfig.fullName}
            </p>
            <p className="mt-4 font-display font-semibold text-base text-brand-warm/90">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Навигация */}
          <nav aria-label="Навигация в подвале">
            <h3 className="font-display font-semibold text-sm text-background/90 uppercase tracking-wider mb-4">
              Разделы
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-sm text-background/60 hover:text-brand-warm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Контакты */}
          <div>
            <h3 className="font-display font-semibold text-sm text-background/90 uppercase tracking-wider mb-4">
              Контакты
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-warm flex-shrink-0 mt-0.5" />
                <span className="text-sm text-background/60 leading-relaxed">
                  {siteConfig.city}, {siteConfig.address}
                </span>
              </li>
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="flex items-center gap-2.5 text-sm text-background/60 hover:text-brand-warm transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-warm flex-shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-background/60 hover:text-brand-warm transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-brand-warm flex-shrink-0" />
                  {siteConfig.vkDisplay}
                </a>
              </li>
            </ul>
          </div>

          {/* Юридические ссылки */}
          <div>
            <h3 className="font-display font-semibold text-sm text-background/90 uppercase tracking-wider mb-4">
              Документы
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/60 hover:text-brand-warm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя полоса */}
        <div className="mt-12 pt-6 border-t border-background/10">
          <p className="text-xs text-background/50 text-center">
            © {new Date().getFullYear()} {siteConfig.fullName}. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLogo() {
  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg viewBox="0 0 44 44" fill="none" className="w-full h-full" aria-hidden="true">
        <circle cx="22" cy="22" r="20" stroke="hsl(var(--brand-warm))" strokeWidth="2" opacity="0.5" />
        <ellipse
          cx="22"
          cy="22"
          rx="20"
          ry="8"
          stroke="hsl(var(--brand-teal))"
          strokeWidth="1.5"
          opacity="0.5"
          transform="rotate(-30 22 22)"
        />
        <circle cx="22" cy="22" r="13" fill="hsl(var(--brand-warm))" />
        <path d="M27 18.5a6 6 0 1 0 0 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="38" cy="14" r="2.5" fill="hsl(var(--brand-teal))" />
      </svg>
    </div>
  );
}
