"use client";

import { useState } from "react";
import Image from "next/image";
import { GraduationCap, ArrowUpRight } from "lucide-react";
import type { TeacherItem } from "@/lib/teachers";
import { SpecialistModal } from "./SpecialistModal";

interface SpecialistsPageViewProps {
  teachers: TeacherItem[];
}

export function SpecialistsPageView({ teachers }: SpecialistsPageViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (teachers.length === 0) {
    return (
      <div className="container-page mt-12">
        <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-muted-foreground">
          Список специалистов сейчас формируется и скоро появится здесь.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-page mt-10">
        {/* Сетка специалистов: 2 на мобильных, 3–4 на планшетах, 5 на десктопе */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {teachers.map((teacher, index) => (
            <button
              key={teacher.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Открыть данные специалиста: ${teacher.name}`}
              className="card-hover glass rounded-2xl overflow-hidden flex flex-col group h-full text-left cursor-pointer border border-border/60 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
            >
              {/* Фотография: object-cover + object-top гарантирует, что голова не срезается */}
              <div className="relative aspect-[4/4.5] bg-muted overflow-hidden">
                {teacher.photo ? (
                  <Image
                    src={teacher.photo}
                    alt={teacher.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-warm/10">
                    <GraduationCap className="w-12 h-12 text-brand-warm-ink/30" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* Текстовая информация */}
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                    {teacher.name}
                  </h3>
                  {teacher.role && (
                    <p className="text-xs sm:text-sm font-medium text-brand-warm-ink mt-1 line-clamp-2">
                      {teacher.role}
                    </p>
                  )}
                  {teacher.bio && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                      {teacher.bio}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                  <span>Подробнее</span>
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Модальное окно с подробными данными и заслугами */}
      <SpecialistModal
        specialists={teachers}
        currentIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={(newIdx) => setSelectedIndex(newIdx)}
      />
    </>
  );
}

