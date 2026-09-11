"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";
import { useContent } from "./ContentContext";
import { Calendar, ArrowRight } from "lucide-react";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function News() {
  const { news } = useContent();
  if (!news || news.length === 0) return null;

  return (
    <section id="news" className="section-padding relative overflow-hidden">
      <div className="container-max">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-2">
              Новости
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground">
              Что нового в «Сфере»
            </h2>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.slice(0, 6).map((item, i) => (
            <Reveal key={item.vk_post_id ?? i} delay={i * 0.05}>
              <Link
                href={`/news/${item.vk_post_id}`}
                className="group block bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-lg transition-shadow h-full"
              >
                {item.image_url && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={item.published_at.slice(0, 10)}>{formatDate(item.published_at)}</time>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm leading-snug mb-2 group-hover:text-brand-warm transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {item.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-warm opacity-0 group-hover:opacity-100 transition-opacity">
                    Читать полностью <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {news.length > 6 && (
          <Reveal>
            <div className="text-center mt-10">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-warm hover:text-brand-warm transition-colors"
              >
                Все новости <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
