import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { Schedule } from "@/components/site/Schedule";
import { SchedulePrint } from "@/components/site/SchedulePrint";

export const metadata: Metadata = {
  title: "Расписание занятий в «Сфере» — Горячий Ключ | дни и часы",
  description:
    "Актуальное расписание занятий студии «Сфера» в Горячем Ключе: подготовка к школе, помощь школьникам, английский, театр. Дни и время по группам, удобная версия для печати.",
  alternates: { canonical: "/raspisanie" },
  openGraph: {
    images: [{ url: "https://gksfera.vercel.app/og-image.png", width: 1200, height: 630, alt: "Расписание «Сфера»" }],
  },
};

// Расписание должно отражать правки из админки сразу, без устаревшего кэша.
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const { data, visibility } = await getContent();
  // Раздел можно отключить в админке — тогда страницы нет (404) и пункта в меню тоже.
  if (visibility.raspisanie === false) notFound();
  const groups = (data.schedule ?? []).filter((g) => g && Array.isArray(g.days));

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        {/* Экранная вёрстка в печать не уходит: для бумаги есть бланк
            SchedulePrint ниже — он влезает в один лист A4. */}
        <div className="container-page print:hidden">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2">
            Расписание
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
            Расписание занятий
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Актуальные дни и часы занятий по группам. Расписание может меняться в
            течение учебного года — точное время уточняйте у педагога или по телефону.
          </p>

          {groups.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center max-w-lg mt-12">
              <p className="text-muted-foreground">
                Расписание пока не опубликовано. Позвоните нам — подскажем дни и часы
                занятий для вашего ребёнка.
              </p>
            </div>
          ) : (
            <Schedule groups={groups} />
          )}
        </div>
        <SchedulePrint groups={groups} studio={data.siteConfig} />
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
