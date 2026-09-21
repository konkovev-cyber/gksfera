"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, X } from "lucide-react";
import { useContent } from "./ContentContext";
import { cn } from "@/lib/utils";

/**
 * Плавающая кнопка быстрой связи (правый нижний угол).
 * Появляется только после прокрутки на 300 px (чтобы не мешать Hero).
 * Разворачивается в веер с каналами: MAX, ВКонтакте, телефон.
 */
export function FloatContact() {
  const content = useContent();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Появляется после прокрутки на 300px
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const cfg = content.siteConfig;

  /** Кнопки-каналы: только если URL задан */
  const channels: {
    label: string;
    href: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }[] = [
    // Телефон — всегда
    {
      label: cfg.phone,
      href: cfg.phoneHref,
      icon: <Phone className="w-5 h-5" />,
      color: "text-white",
      bg: "bg-brand-warm",
    },
    // MAX — если задан
    ...(cfg.maxUrl
      ? [
          {
            label: "Написать в MAX",
            href: cfg.maxUrl,
            icon: <MessageCircle className="w-5 h-5" />,
            color: "text-white",
            bg: "bg-brand-teal",
          },
        ]
      : []),
    // ВКонтакте — если задан
    ...(cfg.vkUrl
      ? [
          {
            label: "ВКонтакте",
            href: cfg.vkUrl,
            icon: (
              // Иконка VK SVG (не требует сторонних зависимостей)
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M19.915 13.028c-.388-.49-.277-.708 0-1.146.005-.005 3.851-5.306 4.246-7.107l.002-.007c.194-.65 0-1.128-.947-1.128h-3.135c-.796 0-1.163.414-1.357.874 0 0-1.587 3.782-3.836 6.237-.727.713-1.057.94-1.453.94-.199 0-.487-.227-.487-.877V4.768c0-.783-.232-1.128-.897-1.128H8.708c-.502 0-.803.365-.803.712 0 .75 1.138.924 1.255 3.036v4.588c0 .995-.183 1.175-.579 1.175-1.057 0-3.625-3.802-5.148-8.15C3.143 3.36 2.84 3 2.038 3H-.097C-1 3 -1.2 3.414-1.2 3.874c0 .806 1.057 4.802 4.921 10.088 2.576 3.641 6.203 5.614 9.507 5.614 1.981 0 2.225-.437 2.225-1.19v-2.749c0-.888.19-1.064.832-1.064.472 0 1.28.233 3.169 2.028C21.438 18.378 21.771 19 22.847 19h3.135c.902 0 1.354-.437 1.092-1.302-.285-.862-1.294-2.11-2.636-3.59-.727-.84-1.818-1.742-2.523-2.08z" />
              </svg>
            ),
            color: "text-white",
            bg: "bg-[#0077FF]",
          },
        ]
      : []),
  ];

  return (
    <div
      className="fixed bottom-6 left-4 sm:left-6 z-[55] flex flex-col items-start gap-2.5"
      aria-label="Быстрая связь со студией"
    >
      {/* Кнопки каналов */}
      <AnimatePresence>
        {open &&
          channels.map((ch, i) => (
            <motion.div
              key={ch.href}
              initial={{ opacity: 0, scale: 0.6, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 16 }}
              transition={{
                delay: open ? i * 0.07 : (channels.length - 1 - i) * 0.05,
                type: "spring",
                damping: 22,
                stiffness: 300,
              }}
              className="flex items-center flex-row-reverse gap-2.5 group"
            >
              {/* Подпись */}
              <span className="px-3 py-1.5 text-sm font-medium bg-card text-foreground rounded-xl shadow-lg border border-border/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none select-none">
                {ch.label}
              </span>
              {/* Иконка-ссылка */}
              <a
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={ch.label}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                  "hover:scale-110 active:scale-95 transition-transform duration-150",
                  ch.bg,
                  ch.color
                )}
              >
                {ch.icon}
              </a>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Главная кнопка-триггер */}
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", damping: 20, stiffness: 280 }}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Закрыть меню связи" : "Написать нам"}
            aria-expanded={open}
            className={cn(
              "relative w-14 h-14 rounded-full shadow-[0_6px_24px_-4px_rgba(0,0,0,0.35)] flex items-center justify-center transition-colors duration-200",
              open
                ? "bg-foreground text-background"
                : "bg-primary text-primary-foreground"
            )}
          >
            {/* Пульсирующий круг (только когда закрыто) */}
            {!open && (
              <span
                className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping"
                aria-hidden="true"
              />
            )}
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              {open ? (
                <X className="w-6 h-6" />
              ) : (
                <MessageCircle className="w-6 h-6" />
              )}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
