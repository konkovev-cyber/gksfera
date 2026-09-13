"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "./ContentContext";
import { ThemeToggle } from "./ThemeToggle";

import { cn } from "@/lib/utils";

export function Header() {
  const content = useContent();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Секции нет на текущей странице — ведём на главную к секции
        router.push(`/${href}`);
      }
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <div className="container-max flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 md:h-20">
          {/* Логотип */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Сфера — на главную"
          >
            <Logo scrolled={scrolled} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-extrabold text-xl tracking-tight text-foreground">
                СФЕРА
              </span>
              <span className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 font-medium">
                Учебно-развивающая студия
              </span>
            </div>
          </Link>

          {/* Десктоп-меню */}
          <nav className="hidden lg:flex items-center gap-1">
            {content.navItems
              .filter((item: any) => !item.show || item.show())
              .map((item: any) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary rounded-lg transition-colors hover:bg-accent/50"
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          {/* Кнопка записи + телефон */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <a
              href={content.siteConfig.phoneHref}
              className="hidden xl:flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              aria-label="Позвонить в студию"
            >
              <Phone className="w-4 h-4" />
              {content.siteConfig.phone}
            </a>
            <Link
              href="#enrollment"
              onClick={(e) => handleNavClick(e, "#enrollment")}
              className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Записаться
            </Link>

            {/* Мобильное меню — бургер */}
            <button
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Открыть меню"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-card shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <Link href="/" className="flex items-center gap-3">
                  <Logo scrolled={false} />
                  <div className="flex flex-col leading-tight">
                    <span className="font-display font-extrabold text-lg tracking-tight text-foreground">
                      СФЕРА
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Учебно-развивающая студия
                    </span>
                  </div>
                </Link>
                <button
                  className="inline-flex items-center justify-center w-11 h-11 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-5">
                <ul className="space-y-1">
                  {content.navItems
                    .filter((item: any) => !item.show || item.show())
                    .map((item: any, i: number) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent/50 rounded-xl transition-colors"
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    ))}
                </ul>
              </nav>

              <div className="p-5 border-t border-border space-y-3">
                <a
                  href={content.siteConfig.phoneHref}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-border font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {content.siteConfig.phone}
                </a>
                {content.siteConfig.maxUrl && (
                  <a
                    href={content.siteConfig.maxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-brand-teal/30 text-brand-teal font-semibold hover:bg-brand-teal/10 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Написать в MAX
                  </a>
                )}
                <Link
                  href="#enrollment"
                  onClick={(e) => handleNavClick(e, "#enrollment")}
                  className="flex items-center justify-center w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  Записаться
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="relative w-11 h-11 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
      <Image
        src="/images/logo-icon.png"
        alt="Логотип Сфера"
        width={44}
        height={44}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        priority
      />
    </div>
  );
}
