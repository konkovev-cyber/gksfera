"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Backpack, Pencil, Languages, PenLine, BrainCircuit, Drama, House, GraduationCap, PenTool, ArrowRight } from "lucide-react";
import { useContent } from "./ContentContext";
import { type Program } from "@/data/site";

import { Reveal, Stagger, StaggerItem } from "./Reveal";

const iconMap: Record<string, React.ElementType> = {
  Backpack,
  Pencil,
  Languages,
  PenLine,
  BrainCircuit,
  Drama,
  House,
  GraduationCap,
  PenTool,
};

export function Programs() {
  const content = useContent();
  return (
    <section id="programs" className="section-padding bg-brand-cream/50 relative overflow-hidden">
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-teal/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
            Направления
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance max-w-3xl leading-[1.15]">
            Чем можно заниматься в «Сфере»
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Выберите направление, которое подходит вашему ребёнку по возрасту и интересам.
            На каждое можно записаться отдельно или проконсультироваться, если сомневаетесь.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {content.programs.map((program) => (
            <StaggerItem key={program.id}>
              <ProgramCard program={program} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const reduced = useReducedMotion();
  const Icon = iconMap[program.icon] ?? Backpack;

  const scrollToEnrollment = () => {
    const el = document.querySelector("#enrollment");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.article
      data-program-id={program.id}
      whileHover={reduced ? {} : { y: -6 }}
      transition={{ duration: 0.3 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-xl transition-shadow h-full flex flex-col"
    >
      {/* Изображение */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={program.image}
          alt={program.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-xs font-semibold text-foreground shadow-sm">
          <Icon className="w-3.5 h-3.5 text-brand-warm" />
          {program.ageRange}
        </div>
      </div>

      {/* Контент */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="font-display font-bold text-xl text-foreground mb-2">
          {program.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {program.description}
        </p>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={scrollToEnrollment}
            className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Записаться
          </button>
          <button
            onClick={scrollToEnrollment}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/60 hover:text-brand-warm transition-colors"
          >
            Подробнее
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
