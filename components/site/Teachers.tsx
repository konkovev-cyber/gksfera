"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { useContent } from "./ContentContext";

import { Reveal, Stagger, StaggerItem } from "./Reveal";

export function Teachers() {
  const content = useContent();
  if (!content.siteConfig.showTeachers) return null;

  return (
    <section id="teachers" className="section-padding relative overflow-hidden">
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
            Педагоги
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
            Люди, которые помогают детям расти
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Педагоги «Сферы» — это внимание, терпение и искренний интерес к каждому ребёнку.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {content.teachers.map((teacher) => (
            <StaggerItem key={teacher.id}>
              <div className="card-hover bg-card rounded-2xl overflow-hidden border border-border/60 h-full">
                <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                  {teacher.photo ? (
                    <Image
                      src={teacher.photo}
                      alt={teacher.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-warm/10">
                      <GraduationCap className="w-16 h-16 text-brand-warm/30" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    {teacher.name}
                  </h3>
                  <p className="text-sm font-medium text-brand-warm mt-1">
                    {teacher.role}
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {teacher.bio}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
