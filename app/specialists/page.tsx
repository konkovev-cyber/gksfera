import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, Phone, Sparkles } from "lucide-react";
import { getContent } from "@/lib/content";
import { ldScript } from "@/lib/utils";
import { SITE_ORIGIN } from "@/data/site";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { isRealTeacher } from "@/lib/teachers";

export const metadata: Metadata = {
  title: "Специалисты — студия «Сфера» Горячий Ключ",
  description:
    "Команда специалистов учебно-развивающей студии «Сфера» в Горячем Ключе. Опытные педагоги, репетиторы, подготовка к школе и индивидуальный подход к каждому ребёнку.",
  alternates: { canonical: "/specialists" },
  openGraph: {
    images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630, alt: "Специалисты студии «Сфера»" }],
  },
};

export const dynamic = "force-dynamic";

export default async function SpecialistsPage() {
  const { data, visibility } = await getContent();
  if (visibility.teachers === false) notFound();

  const teachers = (data.teachers || []).filter(isRealTeacher);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Специалисты — ${data.siteConfig.fullName}`,
    description: "Команда специалистов студии «Сфера» в Горячем Ключе.",
    url: `${SITE_ORIGIN}/specialists`,
    numberOfItems: teachers.length,
    itemListElement: teachers.map((t, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Person",
        name: t.name,
        jobTitle: t.role,
        description: t.bio,
        image: t.photo ? `${SITE_ORIGIN}${t.photo.startsWith("/") ? "" : "/"}${t.photo}` : undefined,
      },
    })),
  };

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }}
        />
        <div className="container-page">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Главная</span>
            </Link>
          </nav>

          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2">
            Команда студии
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
            Специалисты
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Педагоги и наставники «Сферы» — люди с профильным образованием, терпением и искренним вниманием к каждому ребёнку.
          </p>
        </div>

        {teachers.length === 0 ? (
          <div className="container-page mt-12">
            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-muted-foreground">
              Список специалистов сейчас формируется и скоро появится здесь.
            </div>
          </div>
        ) : (
          <div className="container-page mt-10">
            {/* 2 строчки по 5 на десктопе: lg:grid-cols-5 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {teachers.map((t) => (
                <div key={t.id} className="card-hover glass rounded-2xl overflow-hidden flex flex-col group h-full">
                  <div className="relative aspect-[4/4.5] bg-muted overflow-hidden">
                    {t.photo ? (
                      <Image
                        src={t.photo}
                        alt={t.name}
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
                      {t.name}
                    </h3>
                    {t.role && (
                      <p className="text-xs sm:text-sm font-medium text-brand-warm-ink mt-1">
                        {t.role}
                      </p>
                    )}
                    {t.bio && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {t.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA блок записи */}
        <div className="container-page mt-14 sm:mt-16">
          <div className="rounded-3xl glass p-6 sm:p-8 md:p-10 border border-brand-warm/20 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-warm/15 text-brand-warm-ink mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Первое знакомство
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                Хотите познакомиться со специалистами лично?
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                Приходите на консультацию или пробное занятие: покажем студию, познакомимся и ответим на все вопросы.
              </p>
            </div>
            <a
              href={`tel:${data.siteConfig.phoneHref || data.siteConfig.phone}`}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>{data.siteConfig.phone}</span>
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}

