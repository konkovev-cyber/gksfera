import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { TaskPicker } from "@/components/site/TaskPicker";
import { About } from "@/components/site/About";
import { Programs } from "@/components/site/Programs";
import { Results } from "@/components/site/Results";
import { TrustStats } from "@/components/site/TrustStats";
import { LearningExperience } from "@/components/site/LearningExperience";
import { Gallery } from "@/components/site/Gallery";
import { Teachers } from "@/components/site/Teachers";
import { Reviews } from "@/components/site/Reviews";
import { Events } from "@/components/site/Events";
import { News } from "@/components/site/News";
import { FAQ } from "@/components/site/FAQ";
import { ParentNavigator } from "@/components/site/ParentNavigator";
import { CTA } from "@/components/site/CTA";
import { Contact } from "@/components/site/Contact";
import { EnrollmentForm } from "@/components/site/EnrollmentForm";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { BackToTop } from "@/components/site/BackToTop";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { getContent, type Visibility } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Suspense, type ReactNode } from "react";

export const dynamic = "force-dynamic";

// Canonical теперь задаётся каждой страницей: из корневого layout он текла на
// все маршруты без своего значения (см. app/layout.tsx).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Реестр блоков главной: id → компонент + (опц.) ключ видимости.
 * Порядок задаётся data.sectionsOrder (переставляется в админке, вкладка
 * «Порядок»). Hero закреплён сверху, обвязка — снизу, они не перемещаются.
 */
const SECTIONS: Record<string, { el: ReactNode; vis?: keyof Visibility }> = {
  tasks: { el: <TaskPicker /> },
  about: { el: <About />, vis: "about" },
  programs: { el: <Programs />, vis: "programs" },
  results: { el: <Results /> },
  truststats: { el: <TrustStats /> },
  learning: { el: <LearningExperience />, vis: "learning" },
  gallery: { el: <Gallery />, vis: "gallery" },
  teachers: { el: <Teachers />, vis: "teachers" },
  reviews: { el: <Reviews />, vis: "reviews" },
  events: { el: <Events />, vis: "events" },
  news: { el: <News />, vis: "news" },
  faq: { el: <FAQ />, vis: "faq" },
  parentnav: { el: <ParentNavigator /> },
  cta: { el: <CTA />, vis: "cta" },
  enrollment: {
    el: (
      <Suspense fallback={null}>
        <EnrollmentForm />
      </Suspense>
    ),
    vis: "enrollment",
  },
  contacts: { el: <Contact />, vis: "contacts" },
};

export default async function Home() {
  const { data, visibility } = await getContent();
  const order = data.sectionsOrder ?? [];

  return (
    <ContentProvider value={data}>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        {order.map((id) => {
          const s = SECTIONS[id];
          if (!s) return null;
          if (s.vis && visibility[s.vis] === false) return null; // скрытый блок
          return <div key={id}>{s.el}</div>;
        })}
      </main>
      <Footer />
      <MobileCTA />
      <BackToTop />
    </ContentProvider>
  );
}
