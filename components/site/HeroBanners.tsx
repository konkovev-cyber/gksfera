"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles as SparklesFallback } from "lucide-react";
import { useContent } from "./ContentContext";
import { iconMap } from "./program-icons";
import type { HeroBanner } from "@/data/site";
import { cn } from "@/lib/utils";

/** Мягкие брендовые тона для иконок — те же, что в карточках направлений.
 *  Ключ "violet" исторический: он лежит в данных баннеров, но фиолетового в
 *  палитре нет, поэтому третий акцент — нейтральный песочный с графитовым
 *  чернильным текстом (переворачивается по темам через токены, без `dark:`). */
const ACCENT: Record<string, string> = {
  warm: "bg-brand-warm/10 text-brand-warm-ink ring-brand-warm/20",
  teal: "bg-brand-teal/10 text-brand-teal-ink ring-brand-teal/20",
  violet: "bg-brand-sand/45 text-foreground ring-brand-sand/70",
};

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

/**
 * Ширина ленты подбирается под число баннеров: строка всегда делится на
 * равные ячейки, «хвост» из одной плашки не остаётся.
 *  3 → три в ряд (по 192px в колонке hero), 4 → квадрат 2×2.
 */
function gridFor(n: number) {
  if (n <= 1) return "grid-cols-1";
  if (n === 2) return "grid-cols-1 min-[430px]:grid-cols-2";
  if (n === 3) return "grid-cols-1 min-[560px]:grid-cols-3";
  if (n === 4) return "grid-cols-1 min-[430px]:grid-cols-2";
  return "grid-cols-1 min-[430px]:grid-cols-2 min-[760px]:grid-cols-3";
}

/**
 * Промо-баннеры под кнопками первого экрана.
 *
 * Раньше это были отдельные «облачные чипы» (flex-wrap): каждый — по ширине
 * своего текста, поэтому на десктопе вставали 2 + 1, правый край обрывался на
 * 543px против 688px у текстовой колонки, а внутренние отступы были разными
 * слева и справа (10/12). Теперь одна лента: ячейки равные по построению,
 * разделены волосяной линией, выровнены с колонкой и сверху, и снизу.
 * Круглые плашки иконок — нарочно: «сфера» любит круг.
 *
 * Содержимое и порядок задаются в админке (вкладка «Баннеры»).
 */
export function HeroBanners() {
  const content = useContent();
  const banners = (content.heroBanners ?? []).filter((b) => b && b.title && b.href);
  if (banners.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85, duration: 0.5 }}
      className="glass mt-7 overflow-hidden rounded-2xl"
    >
      <div className={cn("grid gap-px bg-hairline/35", gridFor(banners.length))}>
        {banners.map((b, i) => (
          <BannerCell key={b.id ?? i} b={b} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function BannerCell({ b, index }: { b: HeroBanner; index: number }) {
  const Icon = iconMap[b.icon] ?? SparklesFallback;
  const external = isExternal(b.href);

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "grid place-items-center w-8 h-8 rounded-full ring-1 shrink-0",
          "transition-transform duration-200 group-hover:scale-110",
          ACCENT[b.accent ?? "warm"],
        )}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-tight text-foreground">{b.title}</span>
        {b.subtitle && (
          <span className="mt-0.5 block text-[11px] leading-tight text-foreground/70">{b.subtitle}</span>
        )}
      </span>
      {external && (
        <ArrowUpRight
          aria-hidden="true"
          className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </>
  );

  // Ячейки прозрачные: под ними стекло ленты, а не сплошной card — иначе
  // blur и кромка не было бы видно. Ховер подсвечивает ячейку изнутри.
  const shell = cn(
    "group film-hover flex items-center gap-2.5 px-3 py-3 text-left",
  );

  const href = b.href;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={shell} aria-label={`${b.title} — ${b.subtitle ?? "открыть"}`}>
        {inner}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className={shell}
        onClick={(e) => {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            // Режим «уменьшить движение» смотрим в момент клика: на рендер это
            // не влияет, значит SSR и клиент дают одинаковую разметку.
            const calm =
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
          }
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={shell}>
      {inner}
    </Link>
  );
}
