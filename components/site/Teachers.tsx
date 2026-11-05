"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

const PLACEHOLDER = /^(имя преподавателя|имя специалиста|ф и\.?\s*о\.?|и\.?\s*о\.?|преподаватель|педагог|специалист)$/i;
export function isRealTeacher(t: { name?: string; role?: string }) {
  const name = (t.name || "").trim();
  return name.length >= 2 && !PLACEHOLDER.test(name);
}

export function Teachers() {
  const content = useContent();
  const teachers = (content.teachers || []).filter(isRealTeacher);
  if (teachers.length === 0) return null;

  return (
    <section id="teachers" className="section-padding relative overflow-hidden">
      <div className="container-max relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2 sm:mb-3">
              Специалисты
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
              Люди, которые помогают детям расти
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Специалисты «Сферы» — это внимание, терпение и искренний интерес к каждому ребёнку.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/specialists"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 group py-1"
            >
              <span>Все специалисты</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        {/* 2 строчки по 5 на десктопе: lg:grid-cols-5 */}
        <Stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {teachers.map((teacher) => (
            <StaggerItem key={teacher.id}>
              <div className="card-hover glass rounded-2xl overflow-hidden h-full flex flex-col group">
                <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                  {teacher.photo ? (
                    <Image
                      src={teacher.photo}
                      alt={teacher.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-warm/10">
                      <GraduationCap className="w-12 h-12 text-brand-warm-ink/30" />
                    </div>
                  )}
                </div>
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug">
                    {teacher.name}
                  </h3>
                  {teacher.role && (
                    <p className="text-xs sm:text-sm font-medium text-brand-warm-ink mt-1">
                      {teacher.role}
                    </p>
                  )}
                  {teacher.bio && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                      {teacher.bio}
                    </p>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}