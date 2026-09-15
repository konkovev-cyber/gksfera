import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { Schedule } from "@/components/site/Schedule";

export const metadata: Metadata = {
  title: "Расписание занятий",
  description:
    "Актуальное расписание занятий учебно-развивающей студии «Сфера» в Горячем Ключе. Уроки по дням недели для каждой группы, версия для печати.",
  alternates: { canonical: "/raspisanie" },
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
        <div className="container-max">
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
            <Schedule groups={groups} studioName={data.siteConfig.fullName} />
          )}
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
