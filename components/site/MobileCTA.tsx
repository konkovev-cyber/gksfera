"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, Pencil } from "lucide-react";
import { useContent } from "./ContentContext";


export function MobileCTA() {
  const content = useContent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Показываем после первого экрана
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToEnrollment = () => {
    const el = document.querySelector("#enrollment");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!visible) return null;

  return (
    <div id="mobile-cta" className="fixed bottom-0 left-0 right-0 z-40 md:hidden print:hidden">
      <div className="bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <a
            href={content.siteConfig.phoneHref}
            className="flex flex-col items-center justify-center flex-1 h-12 rounded-xl bg-card border border-border/60 active:scale-95 transition-transform"
            aria-label="Позвонить"
          >
            <Phone className="w-5 h-5 text-brand-warm mb-0.5" />
            <span className="text-[10px] font-medium text-foreground">Позвонить</span>
          </a>
          <a
            href={content.siteConfig.vkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center flex-1 h-12 rounded-xl bg-card border border-border/60 active:scale-95 transition-transform"
            aria-label="Написать в VK"
          >
            <MessageCircle className="w-5 h-5 text-brand-teal mb-0.5" />
            {/* Подписи короткие: рядом появился MAX, четыре кнопки на узком
                экране терпят только одно-два слова. */}
            <span className="text-[10px] font-medium text-foreground">В VK</span>
          </a>
          {content.siteConfig.maxUrl && (
            <a
              href={content.siteConfig.maxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center flex-1 h-12 rounded-xl bg-card border border-border/60 active:scale-95 transition-transform"
              aria-label="Написать в MAX"
            >
              <MessageCircle className="w-5 h-5 text-brand-teal mb-0.5" />
              <span className="text-[10px] font-medium text-foreground">В MAX</span>
            </a>
          )}
          <button
            onClick={scrollToEnrollment}
            className="flex flex-col items-center justify-center flex-1 h-12 rounded-xl bg-primary text-primary-foreground active:scale-95 transition-transform"
            aria-label="Записаться"
          >
            <Pencil className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold">Записаться</span>
          </button>
        </div>
      </div>
    </div>
  );
}
