"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles as SparklesFallback } from "lucide-react";
import { useContent } from "./ContentContext";
import { iconMap } from "./program-icons";
import type { HeroBanner } from "@/data/site";
import { cn } from "@/lib/utils";

const ACCENT: Record<string, string> = {
  warm: "bg-brand-warm/12 text-brand-warm ring-brand-warm/25",
  teal: "bg-brand-teal/12 text-brand-teal ring-brand-teal/25",
  violet: "bg-violet-500/12 text-violet-600 dark:text-violet-300 ring-violet-500/25",
};

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

/**
 * Небольшие промо-баннеры («облачные чипы») под кнопками в первом экране.
 * Содержимое и порядок задаются в админке (вкладка «Баннеры»).
 */
export function HeroBanners() {
  const content = useContent();
  const banners = (content.heroBanners ?? []).filter((b) => b && b.title && b.href);
  if (banners.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3">
      {banners.map((b, i) => (
        <BannerChip key={b.id ?? i} b={b} index={i} />
      ))}
    </div>
  );
}

function BannerChip({ b, index }: { b: HeroBanner; index: number }) {
  const Icon = iconMap[b.icon] ?? SparklesFallback;
  const inner = (
    <>
      <span
        className={cn(
          "grid place-items-center w-9 h-9 rounded-xl ring-1 shrink-0",
          ACCENT[b.accent ?? "warm"],
        )}
        aria-hidden="true"
      >
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-foreground">{b.title}</span>
        {b.subtitle && (
          <span className="block text-[11px] leading-tight text-muted-foreground truncate">{b.subtitle}</span>
        )}
      </span>
      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );

  const shell =
    "group inline-flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-2xl " +
    "bg-card/70 backdrop-blur-md border border-border/60 shadow-sm " +
    "transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5";

  // Анимация всегда одна и та же на сервере и на клиенте: за «уменьшить
  // движение» отвечает глобальный MotionConfig (reducedMotion="user").
  // Ветвиться по useReducedMotion здесь нельзя — набор props различался бы
  // между SSR и клиентом, что давало hydration mismatch у reduce-пользователей.
  const anim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.85 + index * 0.08, duration: 0.45 },
  };

  const href = b.href;
  if (isExternal(href)) {
    return (
      <motion.a {...anim} href={href} target="_blank" rel="noopener noreferrer" className={shell}>
        {inner}
      </motion.a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <motion.a
        {...anim}
        href={href}
        className={shell}
        onClick={(e) => {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            // Привычка пользователя «меньше движения» учитываем в момент клика:
            // на результат рендера это не влияет, значит SSR и клиент совпадают.
            const calm =
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
          }
        }}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.div {...anim}>
      <Link href={href} className={shell}>
        {inner}
      </Link>
    </motion.div>
  );
}
