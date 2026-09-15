import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight, ImageOff } from "lucide-react";
import { getContent, getAllNews } from "@/lib/content";
import { newsUrl, newsKey } from "@/lib/news";
import { NewsSourceBadge } from "@/components/site/NewsArticle";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import type { NewsItem } from "@/data/site";

export const metadata: Metadata = {
  title: "Новости и события",
  description:
    "Новости учебно-развивающей студии «Сфера» в Горячем Ключе: события, объявления, достижения наших учеников.",
  alternates: { canonical: "/news" },
};

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

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={newsUrl(item)}
      className="group block glass rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream/50">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <ImageOff className="w-8 h-8" />
          </div>
        )}
        <NewsSourceBadge item={item} className="absolute left-3 top-3 shadow-sm" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <time dateTime={item.published_at.slice(0, 10)}>{fmtDate(item.published_at)}</time>
        </div>
        <h2 className="font-display font-bold text-foreground text-base leading-snug mb-2 group-hover:text-brand-warm-ink transition-colors line-clamp-2">
          {item.title}
        </h2>
        {item.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{item.excerpt}</p>
        )}
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-warm-ink">
          Читать полностью <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default async function NewsArchivePage() {
  const [{ data }, news] = await Promise.all([getContent(), getAllNews()]);

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <div className="container-page">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-2">
            Новости
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
            Жизнь студии «Сфера»
          </h1>

          {news.length === 0 ? (
            <div className="mt-12 glass rounded-2xl p-10 text-center max-w-lg">
              <p className="text-muted-foreground">
                Новостей пока нет. Загляните позже или читайте нашу группу ВКонтакте — там всё
                публикуется сразу.
              </p>
              {data.siteConfig.vkUrl && (
                <a
                  href={data.siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Наша группа VK
                </a>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {news.map((item, i) => (
                <NewsCard key={newsKey(item) || `n-${i}`} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
