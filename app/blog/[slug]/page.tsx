import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { getContent } from "@/lib/content";
import { ldScript } from "@/lib/utils";
import { mdToHtml } from "@/lib/markdown";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { createClient } from "@supabase/supabase-js";

const service = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = service();
  const { data: post } = await db
    .from("blog_posts")
    .select("title,excerpt,cover,published_at")
    .eq("slug", params.slug)
    .eq("visible", true)
    .maybeSingle();
  if (!post) return { title: "Статья не найдена", robots: { index: false } };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export const revalidate = 3600;

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

/** Простой Markdown → HTML вынесен в lib/markdown.ts — там же, откуда его берёт
 *  страница новости: редактор в админке показывает предпросмотр тем же кодом. */

export default async function BlogPostPage({ params }: Props) {
  const [{ data }, db] = await Promise.all([getContent(), Promise.resolve(service())]);
  const { data: post } = await db
    .from("blog_posts")
    .select("slug,title,excerpt,content,cover,published_at")
    .eq("slug", params.slug)
    .eq("visible", true)
    .maybeSingle();

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    image: post.cover ? [post.cover] : undefined,
    author: { "@type": "Organization", name: data.siteConfig.fullName },
    publisher: { "@type": "Organization", name: data.siteConfig.fullName },
  };

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <article className="container-max max-w-3xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }}
          />

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 min-h-[44px] -my-2 text-sm text-muted-foreground hover:text-brand-warm transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Все статьи
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={post.published_at?.slice(0, 10)}>{fmtDate(post.published_at)}</time>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground text-balance leading-tight">
            {post.title}
          </h1>

          {post.cover && (
            <div className="mt-8 w-full rounded-2xl border border-border/60 overflow-hidden bg-brand-cream/50 max-h-[480px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt={post.title} className="w-full h-full object-contain" />
            </div>
          )}

          <div
            className="mt-8 text-base sm:text-lg text-foreground/90 leading-relaxed prose-brand"
            dangerouslySetInnerHTML={{ __html: mdToHtml(post.content || post.excerpt || "") }}
          />
        </article>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
