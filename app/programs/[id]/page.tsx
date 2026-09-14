import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ChevronRight, CalendarDays, Users, Clock,
  Sparkles, Phone, CheckCircle2, MessageCircle, MapPin, Star, Wallet,
} from "lucide-react";
import { getContent } from "@/lib/content";
import { slugify, ldScript } from "@/lib/utils";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { iconMap } from "@/components/site/program-icons";
import { type Program, programInterestMap, resultsAfterLearning } from "@/data/site";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await getContent();
  const program = data.programs.find((p) => slugify(p.title) === params.id);
  if (!program) return { title: "Направление не найдено", robots: { index: false } };
  return {
    title: { absolute: `${program.title} — студия «Сфера», Горячий Ключ` },
    description: `${program.title} в студии «Сфера» (${program.ageRange}). ${program.description.slice(0, 160)} Пробное занятие бесплатно.`.slice(0, 300),
    alternates: { canonical: `/programs/${params.id}` },
    openGraph: {
      type: "website",
      title: `${program.title} — «Сфера»`,
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
  const slug = slugify(program.title);
  const interestValue = programInterestMap[slug] ?? "";
  const enrollmentHref = interestValue
    ? `/?interest=${encodeURIComponent(interestValue)}#enrollment`
    : "/#enrollment";

  const outcomes = data.programOutcomes[program.title] ?? resultsAfterLearning;
  const categoryLabel = program.category === "creative" ? "Творческий факультатив" : "Учебное направление";

  // Отзывы, релевантные этому направлению
  const relevantReviews = (data.reviews ?? []).slice(0, 3);

  // 2 фото из галереи для блока «Как проходит занятие»
  const galleryShots = (data.gallery ?? []).slice(0, 2);

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
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: "0",
      description: "Первое занятие — бесплатная консультация и знакомство",
    },
  };

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-24 md:pt-32 pb-20">
        <div className="container-max max-w-5xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }}
          />

          {/* Хлебные крошки */}
          <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="min-h-[44px] -my-2 px-1 flex items-center hover:text-brand-warm transition-colors">Главная</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/#programs" className="min-h-[44px] -my-2 px-1 flex items-center hover:text-brand-warm transition-colors">Направления</Link>
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
                  style={{ objectPosition: program.pos || undefined }}
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Текст */}
            <div className={program.image ? "order-2" : "order-1 lg:col-span-2"}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-warm/10 text-brand-warm text-sm font-semibold mb-4">
                <Icon className="w-4 h-4" />
                {categoryLabel}
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground text-balance leading-tight">
                {program.title}
              </h1>

              {/* Мета карточки */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60">
                  <CalendarDays className="w-5 h-5 text-brand-warm shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">Возраст</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{program.ageRange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60">
                  <Users className="w-5 h-5 text-brand-warm shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">Формат</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">Небольшие группы</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60">
                  <Clock className="w-5 h-5 text-brand-warm shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">Занятия</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">1–2 раза в неделю</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60">
                  <Wallet className="w-5 h-5 text-brand-warm shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">Стоимость</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">По запросу</p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {program.description}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={enrollmentHref}
                  prefetch={false}
                  className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Записаться на пробное
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href={data.siteConfig.phoneHref}
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border-2 border-border bg-card/80 font-semibold hover:border-brand-warm hover:text-brand-warm transition-colors"
                >
                  <Phone className="w-4 h-4" /> {data.siteConfig.phone}
                </a>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Первое занятие — знакомство, бесплатно. Отвечаем в течение рабочего дня.
              </p>
            </div>
          </div>

          {/* ЧТО РЕБЁНОК ПОЛУЧИТ */}
          <section className="mt-14 sm:mt-16">
            <div className="rounded-3xl bg-brand-cream/50 border border-border/60 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">Результат</p>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground text-balance">
                Что сможет ребёнок через несколько месяцев занятий
              </h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ПОЧЕМУ У НАС ЭТО ПОЛУЧАЕТСЯ */}
          <section className="mt-10 sm:mt-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-warm mb-2">Наш подход</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
              Почему у нас получается
            </h2>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border/60">
                <Sparkles className="w-6 h-6 text-brand-warm mb-3" />
                <h3 className="font-display font-bold text-base text-foreground">Видим каждого</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  В группе столько детей, сколько нужно педагогу, чтобы уделить время каждому лично.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/60">
                <MessageCircle className="w-6 h-6 text-brand-warm mb-3" />
                <h3 className="font-display font-bold text-base text-foreground">Объясняем на языке ребёнка</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Сложное — простым языком. Без нотаций, крика и давления. Ошибаться — можно и нужно.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/60">
                <MapPin className="w-6 h-6 text-brand-warm mb-3" />
                <h3 className="font-display font-bold text-base text-foreground">Рядом с домом</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {data.siteConfig.addressFull}. Не нужно везти ребёнка через весь город.
                </p>
              </div>
            </div>
          </section>

          {/* КАК ПРОХОДИТ ЗАНЯТИЕ — 2 фото + текст */}
          {galleryShots.length > 0 && (
            <section className="mt-10 sm:mt-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">Атмосфера</p>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
                Как проходит занятие
              </h2>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {galleryShots.map((g, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/60">
                    <Image
                      src={g.src}
                      alt={g.alt || program.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Разминка → объяснение темы → практика с поддержкой педагога → обсуждение.
                Смена деятельности, чтобы ребёнок не устал.
              </p>
            </section>
          )}

          {/* СТОИМОСТЬ */}
          <section className="mt-10 sm:mt-12">
            <div className="rounded-3xl bg-gradient-to-br from-brand-warm/8 to-brand-teal/8 border border-border/60 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-warm mb-2">Стоимость</p>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground leading-tight">
                    Точную цену назовём за 5 минут
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Стоимость зависит от направления, количества занятий в неделю и формата.
                    Для постоянных учеников и при записи на несколько направлений — скидки.
                    Позвоните или напишите — подскажем по вашей ситуации.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:min-w-[220px]">
                  <a
                    href={data.siteConfig.phoneHref}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Позвонить
                  </a>
                  {data.siteConfig.vkUrl && (
                    <a
                      href={data.siteConfig.vkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border-2 border-border bg-card font-semibold text-sm hover:border-brand-warm hover:text-brand-warm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" /> Написать в VK
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ОТЗЫВЫ (релевантные) */}
          {relevantReviews.length > 0 && (
            <section className="mt-10 sm:mt-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-2">Отзывы</p>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
                Что говорят родители
              </h2>
              <div className="mt-6 space-y-4">
                {relevantReviews.map((r) => (
                  <blockquote
                    key={r.id}
                    className="rounded-2xl bg-card border border-border/60 p-5 sm:p-6"
                  >
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-brand-warm text-brand-warm" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed">«{r.text}»</p>
                    <footer className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">{r.author}</span>
                        {r.childInfo && (
                          <span className="text-muted-foreground"> · {r.childInfo}</span>
                        )}
                      </div>
                      {r.source && (
                        <span className="text-xs text-muted-foreground">{r.source}</span>
                      )}
                    </footer>
                  </blockquote>
                ))}
              </div>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1.5 min-h-[44px] -my-2 mt-5 text-sm font-semibold text-brand-warm hover:underline underline-offset-4"
              >
                Все отзывы <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          )}

          {/* ФИНАЛЬНЫЙ CTA */}
          <section className="mt-12 sm:mt-16">
            <div className="rounded-3xl bg-primary text-primary-foreground p-6 sm:p-10 text-center">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-balance">
                Хотите, чтобы ребёнок занимался «{program.title.toLowerCase()}»?
              </h2>
              <p className="mt-3 text-primary-foreground/85 text-base">
                Запишитесь на бесплатное пробное занятие — знакомство без обязательств.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
                <Link
                  href={enrollmentHref}
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-card text-foreground font-semibold hover:bg-card/90 transition-colors"
                >
                  Записаться на пробное
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={data.siteConfig.phoneHref}
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border-2 border-primary-foreground/30 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-colors"
                >
                  <Phone className="w-4 h-4" /> {data.siteConfig.phone}
                </a>
              </div>
            </div>
          </section>

          {/* Другие направления */}
          {others.length > 0 && (
            <section className="mt-14 pt-10 border-t border-border/60">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-foreground">Другие направления</h2>
                <Link href="/#programs" className="inline-flex items-center gap-1.5 min-h-[44px] -my-2 px-1 text-sm text-brand-warm hover:underline underline-offset-4">
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
                          style={{ objectPosition: p.pos || undefined }}
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
            <Link href="/" className="inline-flex items-center gap-1.5 min-h-[44px] -my-2 text-sm text-muted-foreground hover:text-brand-warm transition-colors">
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
