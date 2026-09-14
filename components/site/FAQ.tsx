"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal } from "./Reveal";
import { cn, ldScript } from "@/lib/utils";

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 sm:p-5 text-left gap-4 hover:bg-accent/50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-sm sm:text-base text-foreground">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  const content = useContent();
  const faqs = content.faqs ?? [];
  if (faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq" className="section-padding relative overflow-hidden">
      <div className="container-max max-w-3xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }}
        />
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-2">
              Вопросы
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground">
              Частые вопросы
            </h2>
          </div>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <FAQItem question={faq.question} answer={faq.answer} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
