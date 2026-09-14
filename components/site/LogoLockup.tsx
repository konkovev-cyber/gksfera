import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Единый логотип-блок: круглая марка + текстовая подпись.
 *
 * Раньше в шапке был отдельный wordmark-овал (картинка logo-wordmark.png),
 * а в подвале — круглая иконка с текстом, набранным на месте. Разъезжались:
 * в шапке подпись звала «Развивающая студия», в подвале — «Студия · Горячий
 * Ключ». Теперь один компонент, правки идут в оба места сразу.
 */
type Props = {
  /** md — как в подвале (иконка 44px), sm — чуть компактнее */
  size?: "sm" | "md";
  /** на тёмном фоне (подвал): светлый текст и кольцевая обводка */
  onDark?: boolean;
  /** шапка грузится вместе с первым экраном */
  priority?: boolean;
  /** подпись под названием */
  caption?: string;
  className?: string;
};

export const LOGO_CAPTION = "Студия · Горячий Ключ";

export function LogoLockup({ size = "md", onDark = false, priority = false, caption = LOGO_CAPTION, className }: Props) {
  const box = size === "sm" ? "w-10 h-10" : "w-11 h-11";
  const title = size === "sm" ? "text-base" : "text-lg sm:text-xl";

  return (
    <div className={cn("flex items-center gap-2.5 sm:gap-3 min-w-0", className)}>
      <div
        className={cn(
          "relative flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm transition-transform duration-300 group-hover:scale-105",
          box,
          onDark ? "ring-1 ring-white/15" : "ring-1 ring-black/5",
        )}
      >
        <Image
          src="/images/logo-icon.png"
          alt="Логотип студии «Сфера»"
          width={88}
          height={88}
          priority={priority}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight whitespace-nowrap",
            title,
            onDark ? "text-background" : "text-foreground",
          )}
        >
          СФЕРА
        </span>
        <span
          className={cn(
            "text-[10px] sm:text-[11px] font-medium whitespace-nowrap mt-0.5",
            onDark ? "text-background/60" : "text-muted-foreground",
          )}
        >
          {caption}
        </span>
      </div>
    </div>
  );
}
