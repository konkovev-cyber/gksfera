import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ChevronRight, CalendarDays, Users,
  Sparkles, Phone, CheckCircle2,
} from "lucide-react";
import { getContent } from "@/lib/content";
import { slugify } from "@/lib/utils";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { iconMap } from "@/components/site/program-icons";
import type { Program } from "@/data/site";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await getContent();
  const program = data.programs.find((p) => slugify(p.title) === params.id);
  if (!program) return { title: "Направление не найдено", robots: { index: false } };
  return {
    title: program.title,
    description: `${program.title} в студии «Сфера», Горячий Ключ. ${program.ageRange}. ${program.description}`.slice(0, 300),
    alternates: { canonical: `/programs/${params.id}` },
    openGraph: {
      type: "website",
      title: program.title,
      description: program.description,
      images: program.image ? [{ url: program.image }] : undefined,
    },
  };
}

export default async function ProgramPage({ params }: Props) {
  const { data } = await getContent();
  const program: Program | undefined = data.programs.find((p) => slugify(p.title) === params.id);
  if (!program) notFound();

  const others = data.programs.filter((p) => p.id !== program.id).slice(0, 3);
  const Icon = iconMap[program.icon] ?? Sparkles;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.description,
    provider: {
      "@type": "EducationalOrganization",
      name: data.siteConfig.fullName,
      address: `${data.siteConfig.city}, ${data.siteConfig.address}`,
      telephone: data.siteConfig.phone,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      location: {
        "@type": "Place",
        name: data.siteConfig.fullName,
        address: `${data.siteConfig.city}, ${data.siteConfig.addressFull}`,
      },
    },
  };

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-24 md:pt-32 pb-20">
        <div className="container-max max-w-5xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          {/* Хлебные крошки */}
          <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-brand-warm transition-colors">Главная</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/#programs" className="hover:text-brand-warm transition-colors">Направления</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{program.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Фото */}
            {program.image && (
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border/60 shadow-xl order-1">
                <Image
                  src={program.image}
                  alt={program.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Текст */}
            <div className={program.image ? "order-2" : "order-1 lg:col-span-2"}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-warm/10 text-brand-warm text-sm font-semibold mb-4">
                <Icon className="w-4 h-4" />
                Направление
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground text-balance leading-tight">
                {program.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border/60 text-foreground">
                  <CalendarDays className="w-4 h-4 text-brand-warm" />
                  {program.ageRange}
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border/60 text-foreground">
                  <Users className="w-4 h-4 text-brand-warm" />
                  Небольшие группы
                </span>
              </div>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {program.description}
              </p>

              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                  Педагог видит каждого ребёнка и уделяет внимание лично
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                  Понятные объяснения без давления и спешки
                </li>
                <li className="flex items-start gap-3 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                  Первое занятие — знакомство, чтобы всё понравилось ребёнку
                </li>
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/#enrollment"
                  className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Записаться на «{program.title}»
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href={data.siteConfig.phoneHref}
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border-2 border-border bg-card/80 font-semibold hover:border-brand-warm hover:text-brand-warm transition-colors"
                >
                  <Phone className="w-4 h-4" /> {data.siteConfig.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Другие направления */}
          {others.length > 0 && (
            <section className="mt-16 pt-12 border-t border-border/60">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-foreground">Другие направления</h2>
                <Link href="/#programs" className="inline-flex items-center gap-1.5 text-sm text-brand-warm hover:underline underline-offset-4">
                  Все направления <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {others.map((p) => (
                  <Link
                    key={p.id}
                    href={`/programs/${slugify(p.title)}`}
                    className="group bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {p.image && (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={p.image}
                          alt={p.imageAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{p.ageRange}</p>
                      <h3 className="font-display font-bold text-foreground text-sm group-hover:text-brand-warm transition-colors">
                        {p.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-warm transition-colors">
              <ArrowLeft className="w-4 h-4" /> На главную
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
