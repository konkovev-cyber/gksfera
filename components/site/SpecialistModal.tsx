"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  GraduationCap,
  Sparkles,
  Phone,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle2,
} from "lucide-react";
import type { TeacherItem } from "@/lib/teachers";
import { useContent } from "./ContentContext";

interface SpecialistModalProps {
  specialists: TeacherItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function SpecialistModal({
  specialists,
  currentIndex,
  onClose,
  onNavigate,
}: SpecialistModalProps) {
  const content = useContent();
  const isOpen = currentIndex !== null && !!specialists[currentIndex];
  const specialist = isOpen ? specialists[currentIndex] : null;
  const total = specialists.length;

  const handlePrev = useCallback(() => {
    if (currentIndex === null || total <= 1) return;
    onNavigate((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex === null || total <= 1) return;
    onNavigate((currentIndex + 1) % total);
  }, [currentIndex, total, onNavigate]);

  // Управление с клавиатуры: Escape — закрыть, Стрелки — листать
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  return (
    <AnimatePresence>
      {isOpen && specialist && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={specialist.name}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
        >
          {/* Полупрозрачный фон с размытием */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Стрелки переключения специалистов слева/справа от окна на десктопе */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Предыдущий специалист"
                className="hidden lg:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-card/90 hover:bg-card border border-border shadow-xl items-center justify-center text-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Следующий специалист"
                className="hidden lg:flex absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-card/90 hover:bg-card border border-border shadow-xl items-center justify-center text-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Карточка-модалка */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-background/80 hover:bg-background border border-border/60 text-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Скроллируемая область контента */}
            <div className="overflow-y-auto p-5 sm:p-7 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
                {/* Фотография специалиста (object-top — голова никогда не обрезается!) */}
                <div className="relative w-full sm:w-52 aspect-[4/4.8] sm:aspect-[3/4] shrink-0 rounded-2xl overflow-hidden bg-muted border border-border/60 shadow-sm">
                  {specialist.photo ? (
                    <Image
                      src={specialist.photo}
                      alt={specialist.name}
                      fill
                      priority
                      sizes="(max-width: 640px) 100vw, 220px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-warm/10">
                      <GraduationCap className="w-16 h-16 text-brand-warm-ink/30" />
                    </div>
                  )}
                </div>

                {/* Основная информация */}
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-warm/15 text-brand-warm-ink mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Специалист студии «Сфера»</span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-foreground leading-tight text-balance">
                    {specialist.name}
                  </h3>

                  {specialist.role && (
                    <p className="mt-2 text-sm sm:text-base font-semibold text-primary">
                      {specialist.role}
                    </p>
                  )}

                  {/* Достоинства и подход */}
                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Индивидуальный подход к ребёнку</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Профильное образование и опыт работы</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Комфортная и вдохновляющая атмосфера</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Заслуги, опыт и подробная информация */}
              <div className="rounded-2xl bg-muted/40 border border-border/60 p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Award className="w-4 h-4 text-brand-warm-ink" />
                  <span>Заслуги, опыт и информация</span>
                </div>
                <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {specialist.bio && specialist.bio.trim().length > 0 ? (
                    specialist.bio
                  ) : (
                    <span className="text-muted-foreground">
                      Педагог ведёт занятия в учебно-развивающей студии «Сфера» в Горячем Ключе.
                      Высокая квалификация, внимательное отношение к особенностям восприятия каждого ученика и помощь в достижении уверенных результатов.
                    </span>
                  )}
                </div>
              </div>

              {/* Кнопка записи и контакты */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60">
                <a
                  href={`tel:${content.siteConfig.phoneHref || content.siteConfig.phone}`}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Записаться к специалисту</span>
                </a>

                {total > 1 && (
                  <div className="flex items-center justify-center gap-2 lg:hidden">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Назад</span>
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {(currentIndex ?? 0) + 1} из {total}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent flex items-center gap-1"
                    >
                      <span>Вперёд</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

