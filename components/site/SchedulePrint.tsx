import type { ScheduleGroup } from "@/data/site";
import type { SiteData } from "@/lib/content";

type SheetProps = {
  groups: ScheduleGroup[];
  studio: SiteData["siteConfig"];
};

/** Дни недели в порядке мон→вс: по ним сортируем колонки, как в настоящем
 *  бланке, а не в том порядке, в котором их набрал редактор. */
const DAY_ORDER = [
  "понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье",
];

function dayRank(name: string): number {
  const n = (name || "").trim().toLowerCase();
  const i = DAY_ORDER.findIndex((d) => n.startsWith(d.slice(0, 3)));
  return i < 0 ? DAY_ORDER.length : i;
}

/** Время «8:30» / «14.30» → минуты, чтобы ставить уроки по порядку. */
function timeKey(t: string): number {
  const m = /(\d{1,2})[:.\s](\d{2})/.exec(t || "");
  if (!m) return Number.MAX_SAFE_INTEGER;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Печатный бланк расписания: ONE A4 SHEET, а не экранная страница.
 *
 * Экранная вёрстка (/raspisanie) для печати не годится: стеклянные карточки,
 * крупная типографика и отступы разворачивают список на две-три страницы, а
 * шапка, подвал и кнопки лезут в бумагу. Здесь — компактная сетка «дни
 * колонками», 8.5pt, без фонов и теней; всё остальное на странице скрыто
 * через print:hidden.
 *
 * Правила fit'а держатся в .schedule-sheet в globals.css; проверить можно
 * только машиной — pptr-check/print-sheet-check.js считает страницы
 * настоящего PDF.
 */
export function SchedulePrint({ groups, studio }: SheetProps) {
  const days = groups.reduce((a, g) => a + (g.days?.length ?? 0), 0);
  const lessons = groups.reduce(
    (a, g) => a + (g.days ?? []).reduce((x, d) => x + (d.lessons?.length ?? 0), 0),
    0,
  );
  // Страховка на случай, когда групп или уроков станет заметно больше:
  // плотный ряд всё ещё влезает на лист без ручных правок.
  const dense = lessons > 34 || days > 14 ? " schedule-sheet--dense" : "";

  return (
    <section className={"schedule-sheet" + dense} aria-label="Печатная форма расписания">
      {/* Не <header>/<footer>: глобальное печатное правило выкидывает их из
          бумаги вместе с шапкой и подвалом сайта. */}
      <div className="schedule-sheet__head">
        <div>
          <h2 className="schedule-sheet__title">Расписание занятий</h2>
          <p className="schedule-sheet__org">{studio.fullName}</p>
        </div>
        <div className="schedule-sheet__contact">
          <p>
            {studio.city}, {studio.address}
            {studio.addressDetails ? `, ${studio.addressDetails}` : ""}
          </p>
          <p className="schedule-sheet__phone">{studio.phone}</p>
          {studio.vkDisplay ? <p>{studio.vkDisplay}</p> : null}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="schedule-sheet__empty">
          Расписание ещё не опубликовано. Позвоните {studio.phone} — подскажем дни и
          часы занятий для вашего ребёнка.
        </p>
      ) : null}

      {groups.map((g) => {
        const ordered = [...(g.days ?? [])].sort((a, b) => dayRank(a.day) - dayRank(b.day));
        return (
          <article key={g.id ?? g.title} className="schedule-sheet__group">
            <h3 className="schedule-sheet__group-title">
              {g.title}
              {g.note ? <span className="schedule-sheet__group-note">{g.note}</span> : null}
            </h3>
            {ordered.length === 0 ? (
              <p className="schedule-sheet__empty">Дни ещё не опубликованы.</p>
            ) : (
              <div
                className="schedule-sheet__days"
                style={{ gridTemplateColumns: `repeat(${Math.min(ordered.length, 7)}, minmax(0, 1fr))` }}
              >
                {ordered.map((d, di) => {
                  const items = [...(d.lessons ?? [])].sort((a, b) => timeKey(a.time) - timeKey(b.time));
                  const pickup = [...items].reverse().find((l) => l.end)?.end;
                  return (
                    <div key={di} className="schedule-sheet__day">
                      <p className="schedule-sheet__day-name">{d.day}</p>
                      {items.length === 0 ? (
                        <p className="schedule-sheet__off">выходной</p>
                      ) : (
                        <ul className="schedule-sheet__list">
                          {items.map((l, li) => (
                            <li key={li} className="schedule-sheet__lesson">
                              <span className="schedule-sheet__time">{l.time}</span>
                              <span className="schedule-sheet__subject">{l.subject}</span>
                              {l.end ? <span className="schedule-sheet__til">–{l.end}</span> : null}
                            </li>
                          ))}
                        </ul>
                      )}
                      {pickup ? (
                        <p className="schedule-sheet__pickup">
                          <span>забирать</span>
                          <b>{pickup}</b>
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}

      <div className="schedule-sheet__foot">
        <p>
          Расписание может меняться в течение учебного года — точное время уточняйте у
          педагога или по телефону {studio.phone}. Возраст учеников: {studio.ageRange}.
        </p>
        <p className="schedule-sheet__mark">
          {studio.name} · {studio.city} · {studio.workingHoursShort}
        </p>
      </div>
    </section>
  );
}
