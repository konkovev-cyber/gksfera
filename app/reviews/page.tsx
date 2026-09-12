import type { Metadata } from "next";
import Link from "next/link";
import { Quote, ExternalLink } from "lucide-react";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";

export const metadata: Metadata = {
  title: "Отзывы родителей",
  description:
    "Отзывы родителей об учебно-развивающей студии «Сфера» в Горячем Ключе. Реальные мнения о занятиях для детей от 5 до 15 лет.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const { data } = await getContent();
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
            Реальные мнения родителей наших учеников. Если вы тоже занимались у нас — напишите отзыв в нашей группе VK, это поможет другим семьям.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="container-max mt-12">
            <div className="bg-card rounded-2xl border border-border/60 p-8 text-center max-w-lg">
              <p className="text-muted-foreground">Отзывов пока нет. Загляните в нашу группу VK — там живые отзывы от родителей.</p>
              {data.siteConfig.vkUrl && (
                <a
                  href={data.siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Группа VK
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="container-max mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r.id} className="bg-card rounded-2xl border border-border/60 p-5 sm:p-6 flex flex-col">
                <Quote className="w-8 h-8 text-brand-warm/20 mb-3" />
                <p className="text-sm text-foreground leading-relaxed flex-1 whitespace-pre-line">{r.text}</p>
                <div className="mt-4 pt-4 border-t border-border/60">
                  <p className="font-display font-semibold text-sm text-foreground">{r.author}</p>
                  {r.childInfo && (
                    <p className="text-xs text-muted-foreground mt-0.5">{r.childInfo}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {r.source && (
                      <span className="text-xs text-muted-foreground">{r.source}</span>
                    )}
                    {r.sourceUrl && (
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-warm hover:underline"
                      >
                        ссылка <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
