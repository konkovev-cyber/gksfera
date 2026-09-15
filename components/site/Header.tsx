"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "./ContentContext";
import { ThemeToggle } from "./ThemeToggle";
import { MotionToggle } from "./MotionToggle";
import { LogoLockup } from "./LogoLockup";
import type { NavItem } from "@/data/site";

import { cn } from "@/lib/utils";

export function Header() {
  const content = useContent();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  /** Ключ открытого выпадающего меню на десктопе (по label родителя). */
  const [openKey, setOpenKey] = useState<string | null>(null);
  /** Развёрнутые группы в мобильном drawer. */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const navRef = useRef<HTMLDivElement>(null);
  /** Таймер задержки закрытия дропдауна при уходе курсора (чтобы не «мигал»). */
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // На десктопе drawer скрыт (lg:hidden), но его состояние могло остаться
  // открытым после расширения окна — тогда body{overflow:hidden} вешался
  // намертво и страница переставала скроллиться. Закрываем на брейкпоинте.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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

  // Закрытие десктоп-дропдауна: клик вне области и Escape.
  useEffect(() => {
    if (!openKey) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenKey(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  // Смена маршрута — любое открытое меню закрываем.
  useEffect(() => {
    setOpenKey(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const openDrop = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 140);
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setOpenKey(null);
    if (href.startsWith("#")) {
      e.preventDefault();
      // querySelector бросает на невалидном CSS-селекторе (напр. «#2024») —
      // проверяем форму якоря; иначе сразу ведём на главную к секции.
      const valid = /^#[a-zA-Z_][\w-]*$/.test(href);
      const el = valid ? document.querySelector(href) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Секции нет на текущей странице — ведём на главную к секции
        router.push(`/${href}`);
      }
      setMobileOpen(false);
    }
  };

  /** Пункт без подменю. */
  const renderLink = (item: NavItem, className: string, onClick?: () => void) => (
    <Link
      key={item.href}
      href={item.href ?? "#"}
      onClick={(e) => {
        handleNavClick(e, item.href ?? "#");
        onClick?.();
      }}
      className={className}
    >
      {item.label}
    </Link>
  );

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
          {/* Логотип — тот же узел, что в подвале: круглая марка + подпись */}
          <Link
            href="/"
            className="flex items-center group min-w-0"
            aria-label="Сфера — на главную"
          >
            <LogoLockup priority />
          </Link>

          {/* Десктоп-меню */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center gap-1"
            aria-label="Основная навигация"
          >
            {content.navItems.map((item: NavItem) =>
              item.children && item.children.length > 0 ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => openDrop(item.label)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openKey === item.label}
                    onClick={() =>
                      setOpenKey((k) => (k === item.label ? null : item.label))
                    }
                    className={cn(
                      "inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      openKey === item.label
                        ? "text-primary bg-accent/50"
                        : "text-foreground/70 hover:text-primary hover:bg-accent/50"
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        openKey === item.label && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {openKey === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute left-1/2 top-full -translate-x-1/2 pt-2"
                      >
                        <div className="min-w-[230px] rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl p-1.5 shadow-[0_18px_45px_-15px_rgba(0,0,0,0.25)]">
                          {/* Своя ссылка родителя — первым пунктом (если задана) */}
                          {item.href &&
                            renderLink(
                              { label: item.label, href: item.href },
                              "block px-3.5 py-2.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-accent/60 rounded-xl transition-colors"
                            )}
                          {item.children.map((child: NavItem) =>
                            renderLink(
                              child,
                              "block px-3.5 py-2.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-accent/60 rounded-xl transition-colors"
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                renderLink(
                  item,
                  "px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary rounded-lg transition-colors hover:bg-accent/50"
                )
              )
            )}
          </nav>

          {/* Телефон (только иконка — по тапу идёт набор номера), кнопка записи */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Пауза движения — одна на весь сайт (WCAG 2.2.2): смена фото в
                герое, бегущая строка, «дыхание» кадра. Держим в шапке, а не на
                кадре: кадр по требованию владельца без управления, а G186
                разрешает контрол в начале страницы. */}
            <MotionToggle />
            <ThemeToggle />
            <a
              href={content.siteConfig.phoneHref}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border/70 text-foreground/80 hover:text-primary hover:border-primary/50 hover:bg-accent/50 transition-colors"
              aria-label={`Позвонить в студию: ${content.siteConfig.phone}`}
              title={content.siteConfig.phone}
            >
              <Phone className="w-[18px] h-[18px]" />
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
                <Link href="/" className="flex items-center group">
                  <LogoLockup size="sm" />
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
                  {content.navItems.map((item: NavItem, i: number) =>
                    item.children && item.children.length > 0 ? (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((p) => ({ ...p, [item.label]: !p[item.label] }))
                          }
                          aria-expanded={!!expanded[item.label]}
                          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent/50 rounded-xl transition-colors"
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200",
                              expanded[item.label] && "rotate-180"
                            )}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded[item.label] && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeInOut" }}
                              className="overflow-hidden border-l border-border/70 ml-5 pl-2"
                            >
                              {item.href &&
                                renderLink(
                                  { label: item.label, href: item.href },
                                  "block px-4 py-2.5 text-[15px] text-foreground/70 hover:text-primary hover:bg-accent/50 rounded-lg transition-colors",
                                  () => setMobileOpen(false)
                                )}
                              {item.children.map((child: NavItem) =>
                                renderLink(
                                  child,
                                  "block px-4 py-2.5 text-[15px] text-foreground/70 hover:text-primary hover:bg-accent/50 rounded-lg transition-colors",
                                  () => setMobileOpen(false)
                                )
                              )}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    ) : (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <Link
                          href={item.href ?? "#"}
                          onClick={(e) => handleNavClick(e, item.href ?? "#")}
                          className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent/50 rounded-xl transition-colors"
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    )
                  )}
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
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-brand-teal/30 text-brand-teal-ink font-semibold hover:bg-brand-teal/10 transition-colors"
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
