import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { Reviews } from "@/components/site/Reviews";

export const metadata: Metadata = {
  title: "Отзывы родителей",
  description:
    "Отзывы родителей об учебно-развивающей студии «Сфера» в Горячем Ключе. Реальные мнения о занятиях для детей от 5 до 15 лет.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const { data, visibility } = await getContent();

  const reviews = data.reviews ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.siteConfig.fullName,
    address: `${data.siteConfig.city}, ${data.siteConfig.address}`,
    telephone: data.siteConfig.phone,
    aggregateRating: reviews.length > 0 ? {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: String(reviews.length),
      bestRating: "5",
      worstRating: "1",
    } : undefined,
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
    })),
  };

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="container-max">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-2">
            Отзывы
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
            Что говорят родители
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Реальные мнения родителей наших учеников. Если вы тоже занимались у нас — оставьте отзыв, это поможет другим семьям сделать выбор.
          </p>
        </div>

        {/* Рендерим тот же компонент отзывов, что и на главной */}
        <div className="container-max mt-10">
          <Reviews />
        </div>

        <div className="container-max mt-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-warm transition-colors">
            ← На главную
          </Link>
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
