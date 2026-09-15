"use client";

import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { useContent } from "./ContentContext";

import { Reveal, Stagger, StaggerItem } from "./Reveal";

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function Events() {
  const content = useContent();
  if (!content.siteConfig.showEvents) return null;

  return (
    <section id="events" className="section-padding bg-brand-cream/50 relative overflow-hidden">
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-3">
            Жизнь Сферы
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
            События и новости студии
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Спектакли, праздники, мастер-классы, открытые занятия и набор новых групп.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {content.events.map((event) => (
            <StaggerItem key={event.id}>
              <article className="card-hover glass rounded-2xl overflow-hidden h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    style={event.pos ? { objectPosition: event.pos } : undefined}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-warm-ink mb-2">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(event.date)}
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
