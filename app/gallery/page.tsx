import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Images } from "lucide-react";
import { getContent } from "@/lib/content";
import { ldScript } from "@/lib/utils";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { GalleryPageView } from "@/components/site/GalleryPageView";

export const metadata: Metadata = {
  title: "Галерея — фото и видео занятий",
  description:
    "Фотографии и видео учебно-развивающей студии «Сфера» в Горячем Ключе: занятия, творчество, праздники и спектакли.",
  alternates: { canonical: "/gallery" },
};

// Галерея обновляется из админки — показываем свежие файлы без устаревшего кэша.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { data, visibility } = await getContent();
  // Раздел отключается в админке вместе с пунктом меню (тогда страница — 404).
  if (visibility.gallery === false) notFound();

  const items = (data.gallery ?? []).filter((g) => g && typeof g.src === "string" && g.src);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `Галерея — ${data.siteConfig.fullName}`,
    description:
      "Фотографии и видео занятий, творческих работ, праздников и спектаклей студии «Сфера».",
    url: "https://sfera-goryachiy-klyuch.ru/gallery",
    numberOfItems: items.length,
    image: items.map((i) => ({
      "@type": "ImageObject",
      contentUrl: `https://sfera-goryachiy-klyuch.ru${i.src.startsWith("/") ? "" : "/"}${i.src}`,
      caption: i.alt,
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
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2">
                Галерея
              </p>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
                Жизнь «Сферы» в фотографиях
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Занятия, творчество, праздники и спектакли. Нажмите на снимок, чтобы
                открыть его в полном размере — листать можно стрелками или свайпом.
              </p>
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-2.5 rounded-2xl glass px-4 py-3">
                <Images className="w-5 h-5 text-brand-teal-ink shrink-0" aria-hidden="true" />
                <span className="font-display font-extrabold text-2xl text-foreground leading-none tabular-nums">
                  {items.length}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  фото и&nbsp;видео
                  <br />в коллекции
                </span>
              </div>
            )}
          </div>

          <GalleryPageView items={items} />

          {items.length > 0 && (
            <div className="mt-14 rounded-3xl glass p-6 sm:p-8 flex flex-wrap items-center justify-between gap-5">
              <div>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-foreground">
                  Хотите так же?
                </h2>
                <p className="mt-1.5 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                  Приходите на пробное занятие — заодно снимете своего ребёнка в деле,
                  а не только на фотографиях.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/#enrollment"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  Записаться
                </Link>
                {/* Телефон символом — как на страницах направлений: номеру не
                    хватает ширины, и он рвётся по цифрам. */}
                <a
                  href={data.siteConfig.phoneHref}
                  aria-label={`Позвонить: ${data.siteConfig.phone}`}
                  title={data.siteConfig.phone}
                  className="inline-flex items-center justify-center h-11 w-11 shrink-0 rounded-full border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
