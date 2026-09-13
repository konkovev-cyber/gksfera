"use client";

import { trustStats, studioMotto } from "@/data/site";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

export function TrustStats() {
  return (
    <section className="section-padding relative overflow-hidden bg-brand-cream/40">
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3 text-center">
            Почему родители выбирают нас
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance max-w-3xl mx-auto leading-[1.15] text-center">
            Коротко, по делу
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {trustStats.map((s) => (
            <StaggerItem key={`${s.value}-${s.label}`}>
              <div className="bg-card rounded-2xl border border-border/60 p-5 sm:p-6 text-center h-full">
                <p className="font-display font-extrabold text-3xl sm:text-4xl text-brand-warm leading-none">
                  {s.value}
                </p>
                <p className="font-display font-semibold text-base sm:text-lg text-foreground mt-1.5">
                  {s.label}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-snug">
                  {s.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground italic leading-relaxed">
            {studioMotto}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
