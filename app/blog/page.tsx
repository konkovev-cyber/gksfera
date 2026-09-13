import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight, ImageOff } from "lucide-react";
import { getContent } from "@/lib/content";
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

export const metadata: Metadata = {
  title: "Блог — полезные статьи для родителей",
  description:
    "Статьи о развитии детей, подготовке к школе, советы родителям от педагогов учебно-развивающей студии «Сфера» в Горячем Ключе.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 3600;

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

export default async function BlogPage() {
  const [{ data }, db] = await Promise.all([getContent(), Promise.resolve(service())]);

  let posts: Array<{ slug: string; title: string; excerpt: string; cover: string | null; published_at: string }> = [];
  try {
    const { data } = await db
      .from("blog_posts")
      .select("slug,title,excerpt,cover,published_at")
      .eq("visible", true)
      .order("published_at", { ascending: false })
      .limit(50);
    posts = data ?? [];
  } catch {
    // Таблица blog_posts ещё не создана
  }

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <div className="container-max">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-2">
            Блог
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance">
            Полезные статьи для родителей
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Советы педагогов, разборы методик и ответы на вопросы о развитии детей.
          </p>

          {(!posts || posts.length === 0) ? (
            <div className="mt-12 bg-card rounded-2xl border border-border/60 p-10 text-center max-w-lg">
              <p className="text-muted-foreground">Статей пока нет. Загляните позже — мы готовим полезные материалы.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-lg transition-shadow h-full"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream/50">
                    {post.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><ImageOff className="w-8 h-8" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={post.published_at?.slice(0, 10)}>{fmtDate(post.published_at)}</time>
                    </div>
                    <h2 className="font-display font-bold text-foreground text-base leading-snug mb-2 group-hover:text-brand-warm transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-warm opacity-0 group-hover:opacity-100 transition-opacity">
                      Читать <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
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
