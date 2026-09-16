import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone, Backpack } from "lucide-react";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { iconMap } from "@/components/site/program-icons";
import { ldScript, slugify } from "@/lib/utils";
import { SITE_ORIGIN, type Program, programInterestMap } from "@/data/site";

export const metadata: Metadata = {
  title: "Направления занятий",
  description:
    "Все направления учебно-развивающей студии «Сфера» в Горячем Ключе: возраст, чему учим и как записаться.",
  alternates: { canonical: "/programs" },
};

// Карточка на главной скроллит к форме на этой же странице, здесь формы нет —
// поэтому ссылка ведёт на неё через главную, с предзаполненным направлением
// (тот же приём, что и на странице отдельного направления).
function enrollmentHrefFor(program: Program): string {
  const interest = programInterestMap[slugify(program.title)] ?? "";
  return interest ? `/?interest=${encodeURIComponent(interest)}#enrollment` : "/#enrollment";
}

function ProgramCard({ program }: { program: Program }) {
  const Icon = iconMap[program.icon] ?? Backpack;
  const slug = slugify(program.title);

  return (
    <article className="group glass rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={program.image}
          alt={program.imageAlt || program.title}
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

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h2 className="font-display font-bold text-xl text-foreground mb-2">{program.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{program.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={enrollmentHrefFor(program)}
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Записаться
          </a>
          <Link
            href={`/programs/${slug}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-sm font-medium text-muted-foreground hover:text-brand-warm-ink transition-colors"
          >
            Подробнее
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ProgramsIndexPage() {
  const { data } = await getContent();
  const cfg = data.siteConfig;
  const programs = data.programs ?? [];

  // Старая база может без category — тогда один общий блок, как на главной.
  const hasCategories = programs.some((p) => p.category);
  const groups: { title: string; accent: "warm" | "teal"; items: Program[] }[] = hasCategories
    ? [
        {
          title: "Учебные направления",
          accent: "warm" as const,
          items: programs.filter((p) => p.category !== "creative"),
        },
        {
          title: "Творческие факультативы",
          accent: "teal" as const,
          items: programs.filter((p) => p.category === "creative"),
        },
      ].filter((g) => g.items.length)
    : [{ title: "Все направления", accent: "warm" as const, items: programs }];

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Направления студии «${cfg.name}»`,
    itemListElement: programs.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      url: `${SITE_ORIGIN}/programs/${slugify(p.title)}`,
    })),
  };

  return (
    <ContentProvider value={data}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldScript(itemList) }}
      />
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <div className="container-page">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2">
            Направления
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
            Чем занимается «Сфера»
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {programs.length} направлений: от подготовки к школе до сцены и слова. У каждого — свой
            возраст, расписание и результат; ниже есть ссылка на подробную страницу и на запись.
          </p>

          {programs.length === 0 ? (
            <div className="mt-12 glass rounded-2xl p-10 text-center max-w-lg">
              <p className="text-muted-foreground">
                Список направлений сейчас пуст. Напишите нам — расскажем, что открыто на этот сезон.
              </p>
              {cfg.maxUrl && (
                <a
                  href={cfg.maxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Написать в MAX
                </a>
              )}
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.title} className="mt-14 first:mt-10">
                <p
                  className={`text-sm font-semibold uppercase tracking-widest mb-2 ${
                    g.accent === "warm" ? "text-brand-warm-ink" : "text-brand-teal-ink"
                  }`}
                >
                  {g.items.length} шт.
                </p>
                <h2 className="font-display font-bold text-2xl text-foreground">{g.title}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mt-6">
                  {g.items.map((p, i) => (
                    <ProgramCard key={p.id || `${g.title}-${i}`} program={p} />
                  ))}
                </div>
              </section>
            ))
          )}

          {/* Блок «не нашли своё»: здесь есть куда написать, и MAX идёт первым —
              из мессенджеров в России штатно работает только он. */}
          <section className="mt-16">
            <div className="glass rounded-2xl p-8 sm:p-10">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground text-balance">
                Не нашли подходящее направление?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Напишите нам — подскажем, что подойдёт по возрасту и задачам, и свободные места в
                расписании. Отвечаем в тот же канал, из которого пришли.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {cfg.maxUrl && (
                  <a
                    href={cfg.maxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Написать в MAX
                  </a>
                )}
                <a
                  href="/#enrollment"
                  className="btn-outline inline-flex items-center gap-2 h-12 px-6 font-semibold text-sm"
                >
                  Заполнить анкету
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={cfg.phoneHref}
                  className="btn-outline inline-flex items-center gap-2 h-12 px-6 font-semibold text-sm"
                >
                  <Phone className="w-4 h-4" />
                  {cfg.phone}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
