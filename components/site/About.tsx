"use client";

import { BookOpen, Sparkles, Users, HeartHandshake } from "lucide-react";
import { aboutContent } from "@/data/site";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Sparkles,
  Users,
  HeartHandshake,
};

export function About() {
  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Декоративная сфера */}
      <div
        className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-brand-warm/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
            {aboutContent.subtitle}
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance max-w-3xl leading-[1.15]">
            {aboutContent.title}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {aboutContent.intro}
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {aboutContent.principles.map((principle) => {
            const Icon = iconMap[principle.icon] ?? Sparkles;
            return (
              <StaggerItem key={principle.title}>
                <div className="card-hover bg-card rounded-2xl p-6 border border-border/60 h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-warm/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-warm" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {principle.text}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
