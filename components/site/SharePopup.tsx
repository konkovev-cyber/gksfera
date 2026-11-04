"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function SharePopup({
  url,
  title,
  onClose,
  className,
}: {
  url: string;
  title: string;
  onClose: () => void;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      label: "ВКонтакте",
      href: `https://vk.com/share.php?url=${encoded}&title=${encodedTitle}`,
      bg: "bg-[#0077FF]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M19.915 13.028c-.388-.49-.277-.708 0-1.146.005-.005 3.851-5.306 4.246-7.107l.002-.007c.194-.65 0-1.128-.947-1.128h-3.135c-.796 0-1.163.414-1.357.874 0 0-1.587 3.782-3.836 6.237-.727.713-1.057.94-1.453.94-.199 0-.487-.227-.487-.877V4.768c0-.783-.232-1.128-.897-1.128H8.708c-.502 0-.803.365-.803.712 0 .75 1.138.924 1.255 3.036v4.588c0 .995-.183 1.175-.579 1.175-1.057 0-3.625-3.802-5.148-8.15C3.143 3.36 2.84 3 2.038 3H-.097C-1 3 -1.2 3.414-1.2 3.874c0 .806 1.057 4.802 4.921 10.088 2.576 3.641 6.203 5.614 9.507 5.614 1.981 0 2.225-.437 2.225-1.19v-2.749c0-.888.19-1.064.832-1.064.472 0 1.28.233 3.169 2.028C21.438 18.378 21.771 19 22.847 19h3.135c.902 0 1.354-.437 1.092-1.302-.285-.862-1.294-2.11-2.636-3.59-.727-.84-1.818-1.742-2.523-2.08z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
      bg: "bg-[#26A5E4]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      bg: "bg-[#25D366]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Скопируйте ссылку:", url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ type: "spring", damping: 24, stiffness: 320 }}
      className={cn(
        "z-30 w-64 rounded-2xl overflow-hidden shadow-2xl bg-card border border-border/60 backdrop-blur-sm",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <span className="text-sm font-semibold text-foreground">Поделиться</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Кнопки соцсетей */}
      <div className="p-3 flex gap-2 justify-around border-b border-border/50">
        {channels.map((ch) => (
          <a
            key={ch.label}
            href={ch.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group"
            aria-label={ch.label}
          >
            <span
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                "transition-transform duration-150 group-hover:scale-110 group-active:scale-95",
                ch.bg
              )}
            >
              {ch.icon}
            </span>
            <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
              {ch.label}
            </span>
          </a>
        ))}
      </div>

      {/* Копирование ссылки */}
      <div className="p-3">
        <button
          onClick={handleCopy}
          className="w-full h-9 rounded-xl border border-border/60 bg-muted/50 hover:bg-accent flex items-center justify-center gap-2 text-xs font-medium text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span>Ссылка скопирована!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Скопировать ссылку</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
