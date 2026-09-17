"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Backpack, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useContent } from "./ContentContext";
import { type Program } from "@/data/site";
import { iconMap } from "./program-icons";
import { cn, slugify } from "@/lib/utils";

import { Reveal, Stagger, StaggerItem } from "./Reveal";

export function Programs() {
  const content = useContent();
  const allPrograms = content.programs ?? [];

  // Если ни у одной программы нет category (старая база), показываем всё одним блоком
  const hasCategories = allPrograms.some((p) => (p as Program).category);

  if (!hasCategories) {
    return (
      <ProgramsSection
        programs={allPrograms}
        subtitle="Направления"
        title="Чем можно заниматься в «Сфере»"
        description="Выберите направление, которое подходит вашему ребёнку по возрасту и интересам. На каждое можно записаться отдельно или проконсультироваться, если сомневаетесь."
      />
    );
  }

  const educational = allPrograms.filter((p) => (p as Program).category === "educational");
  const creative = allPrograms.filter((p) => (p as Program).category !== "educational");

  return (
    <div id="programs">
      {educational.length > 0 && (
        <ProgramsSection
          programs={educational}
          subtitle="Направления"
          title="Учебные направления"
          description="Подготовка к школе, помощь школьникам с программой, английский язык и коррекция письма. Работаем с ребёнком от 5 до 15 лет — по возрастным группам и индивидуально."
          accent="educational"
        />
      )}

      {creative.length > 0 && (
        <ProgramsSection
          programs={creative}
          subtitle="Факультативы"
          title="Какие творческие факультативы у нас есть"
          description="Сцена, слово и творчество — то, что не измеряется оценками, но сильно влияет на уверенность ребёнка и его умение говорить о себе. Записаться можно на несколько сразу."
          accent="creative"
          isSecondary={educational.length > 0}
        />
      )}
    </div>
  );
}

function ProgramsSection({
  programs,
  subtitle,
  title,
  description,
  accent = "educational",
  isSecondary = false,
}: {
  programs: Program[];
  subtitle: string;
  title: string;
  description: string;
  accent?: "educational" | "creative";
  isSecondary?: boolean;
}) {
  const isEducational = accent === "educational";
  const IconBadge = isEducational ? BookOpen : Sparkles;
  const badgeColor = isEducational ? "text-brand-warm-ink" : "text-brand-teal-ink";
  const dotColor = isEducational ? "bg-brand-warm" : "bg-brand-teal";

  return (
    <section className={cn("section-padding relative overflow-hidden bg-brand-cream/50", isSecondary && "!pt-2 md:!pt-4")}>
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-teal/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <Reveal>
          <p className={`text-sm font-semibold uppercase tracking-widest ${badgeColor} mb-2 sm:mb-3`}>
            {subtitle}
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance max-w-3xl leading-[1.15]">
            {title}
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        </Reveal>

        <Stagger className="mt-7 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {programs.map((program) => (
            <StaggerItem key={program.id}>
              <ProgramCard program={program} dotColor={dotColor} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ProgramCard({ program, dotColor = "bg-brand-warm" }: { program: Program; dotColor?: string }) {
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
      className="group glass rounded-2xl overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col"
    >
      {/* Изображение */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={program.image}
          alt={program.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectPosition: program.pos || undefined }}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-xs font-semibold text-foreground shadow-sm">
          <Icon className="w-3.5 h-3.5 text-brand-warm-ink" />
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
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Записаться
          </button>
          <Link
            href={`/programs/${slugify(program.title)}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-sm font-medium text-muted-foreground hover:text-brand-warm-ink transition-colors"
          >
            Подробнее
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
