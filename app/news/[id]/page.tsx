import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { getContent, getNewsByVkId } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsByVkId(params.id);
  if (!news) return { title: "Новость не найдена", robots: { index: false } };
  return {
    title: news.title,
    description: news.excerpt,
    alternates: { canonical: `/news/${params.id}` },
    openGraph: {
      type: "article",
      title: news.title,
      description: news.excerpt,
      publishedTime: news.published_at,
      images: news.image_url ? [{ url: news.image_url }] : undefined,
    },
  };
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const [{ data }, news] = await Promise.all([getContent(), getNewsByVkId(params.id)]);
  if (!news) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    datePublished: news.published_at,
    description: news.excerpt,
    image: news.image_url ? [news.image_url] : undefined,
    author: { "@type": "Organization", name: "Учебно-развивающая студия «Сфера»" },
  };

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <article className="container-max max-w-3xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-warm transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Все новости
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={news.published_at.slice(0, 10)}>{fmtDate(news.published_at)}</time>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground text-balance leading-tight">
            {news.title}
          </h1>

          {news.image_url && (
            <div className="mt-8 w-full rounded-2xl border border-border/60 overflow-hidden bg-brand-cream/50 max-h-[600px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="mt-8 text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-line">
            {news.content || news.excerpt}
          </div>

          {news.source_url && (
            <a
              href={news.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-warm hover:text-brand-warm transition-colors"
            >
              Обсудить в VK <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </article>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
