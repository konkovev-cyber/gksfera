"use client";

import { useState } from "react";
import { Quote, ExternalLink, ChevronDown } from "lucide-react";
import { useContent } from "./ContentContext";

import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 180;

export function Reviews() {
  const content = useContent();
  if (!content.siteConfig.showReviews) return null;

  return (
    <section id="reviews" className="section-padding relative overflow-hidden">
      <div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-brand-warm/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-3">
            Отзывы
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
            Что говорят родители
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Реальные отзывы из публичных источников — VK и Zoon.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          {content.reviews.map((review) => (
            <StaggerItem key={review.id}>
              <ReviewCard
                text={review.text}
                author={review.author}
                source={review.source}
                sourceUrl={review.sourceUrl}
                childInfo={review.childInfo}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ReviewCard({
  text,
  author,
  source,
  sourceUrl,
  childInfo,
}: {
  text: string;
  author: string;
  source: string;
  sourceUrl?: string;
  childInfo?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > MAX_LENGTH;
  const displayText = isLong && !expanded ? text.slice(0, MAX_LENGTH) + "…" : text;

  return (
    <div className={cn(
      "glass rounded-2xl p-6 h-full flex flex-col",
      "relative"
    )}>
      <Quote className="w-8 h-8 text-brand-warm-ink/20 mb-3 flex-shrink-0" />

      <p className="text-sm sm:text-base text-foreground/80 leading-relaxed flex-1">
        {displayText}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 inline-flex items-center gap-1 min-h-[44px] -my-2 px-1 text-sm font-medium text-brand-warm-ink hover:text-primary transition-colors"
        >
          {expanded ? "Свернуть" : "Читать полностью"}
          <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
        </button>
      )}

      <div className="mt-5 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display font-semibold text-sm text-foreground">{author}</p>
            {childInfo && (
              <p className="text-xs text-muted-foreground mt-0.5">{childInfo}</p>
            )}
          </div>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 min-h-[44px] -my-2 px-1 text-xs text-muted-foreground hover:text-brand-warm-ink transition-colors"
            >
              {source}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground min-h-[44px] -my-2 px-1 flex items-center">{source}</span>
          )}
        </div>
      </div>
    </div>
  );
}
