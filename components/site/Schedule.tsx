"use client";

import { useState } from "react";
import { Printer, ImageDown, CalendarDays } from "lucide-react";
import type { ScheduleGroup, ScheduleLesson } from "@/data/site";
import { cn } from "@/lib/utils";

function LessonRow({ lesson }: { lesson: ScheduleLesson }) {
  const range = lesson.end ? `${lesson.time}–${lesson.end}` : lesson.time;
  return (
    <li className="flex items-baseline gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="shrink-0 tabular-nums text-sm font-bold text-brand-warm min-w-[72px]" title={lesson.end ? `${lesson.time} — до ${lesson.end}` : lesson.time}>
        {range}
      </span>
      <span className="text-sm text-foreground leading-snug">{lesson.subject}</span>
    </li>
  );
}

function GroupCard({ group }: { group: ScheduleGroup }) {
  const days = group.days ?? [];
  return (
    <section className="bg-card rounded-3xl border border-border/60 p-5 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 mb-5">
        <div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-foreground">
            {group.title}
          </h2>
          {group.note && (
            <p className="text-sm text-muted-foreground mt-0.5">{group.note}</p>
          )}
        </div>
      </div>

      {days.length === 0 ? (
        <p className="text-sm text-muted-foreground">Уроки ещё не добавлены.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((d, di) => (
            <div key={di} className="rounded-2xl border border-border/50 bg-background/60 p-4">
              <div className="flex items-center gap-1.5 mb-2 pb-2 border-b-2 border-primary/30">
                <CalendarDays className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="font-display font-bold text-sm text-foreground">{d.day}</span>
              </div>
              {d.lessons.length === 0 ? (
                <p className="text-xs text-muted-foreground">Выходной</p>
              ) : (
                <ul>
                  {d.lessons.map((l, li) => (
                    <LessonRow key={li} lesson={l} />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {group.image && (
        <div className="mt-6 print:hidden">
          <a
            href={group.image}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-border/60 overflow-hidden bg-background hover:border-primary/60 transition-colors"
            title="Открыть картинку-расписание в полном размере (можно скачать и распечатать)"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={group.image} alt={`Расписание — ${group.title}`} className="w-full h-auto" />
          </a>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <ImageDown className="w-3.5 h-3.5" />
            <span>Картинка для печати — нажмите, чтобы открыть в новой вкладке и распечатать.</span>
          </div>
        </div>
      )}
    </section>
  );
}

export function Schedule({ groups, studioName }: { groups: ScheduleGroup[]; studioName: string }) {
  const [printHint, setPrintHint] = useState(false);
  const onPrint = () => {
    setPrintHint(true);
    // Небольшая задержка, чтобы подсказка отрисовалась перед диалогом печати.
    setTimeout(() => window.print(), 60);
  };

  const hasImages = groups.some((g) => !!g.image);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Printer className="w-4 h-4" /> Распечатать
        </button>
        {hasImages && (
          <span className="text-xs text-muted-foreground">
            Если нужно — под таблицей есть картинка-расписание для печати.
          </span>
        )}
      </div>

      {/* Заголовок для листа печати: виден только при печати */}
      <h2 className="hidden print:block font-display font-extrabold text-2xl mb-1">
        {studioName} — расписание занятий
      </h2>
      {printHint && (
        <p className="hidden print:block text-sm text-muted-foreground mb-4">
          Для экономии бумаги включите двустороннюю печать, если страниц несколько.
        </p>
      )}

      <div className={cn("mt-8 space-y-6")}>
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} />
        ))}
      </div>
    </>
  );
}
