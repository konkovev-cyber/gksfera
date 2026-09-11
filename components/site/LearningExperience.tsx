"use client";

import Image from "next/image";
import {
  Users,
  Lightbulb,
  Gamepad2,
  MessagesSquare,
  Palette,
  HeartHandshake,
} from "lucide-react";
import { useContent } from "./ContentContext";

import { Reveal, Stagger, StaggerItem } from "./Reveal";

const iconMap: Record<string, React.ElementType> = {
  Users,
  Lightbulb,
  GamepadIcon: Gamepad2,
  MessagesSquare,
  Palette,
  HeartHandshake,
};

export function LearningExperience() {
  const content = useContent();
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Изображение слева на десктопе */}
          <Reveal>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={content.learningExperience.image}
                alt={content.learningExperience.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-brand-warm/20 -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full border-2 border-brand-teal/30 -z-10" />
            </div>
          </Reveal>

          {/* Контент справа */}
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
                {content.learningExperience.subtitle}
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
                {content.learningExperience.title}
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {content.learningExperience.intro}
              </p>
            </Reveal>

            <Stagger className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4" delay={0.1}>
              {content.learningExperience.items.map((item) => {
                const Icon = iconMap[item.icon] ?? Lightbulb;
                return (
                  <StaggerItem key={item.title}>
                    <div className="flex gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-warm" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
