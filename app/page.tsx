import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Programs } from "@/components/site/Programs";
import { LearningExperience } from "@/components/site/LearningExperience";
import { Gallery } from "@/components/site/Gallery";
import { Teachers } from "@/components/site/Teachers";
import { Reviews } from "@/components/site/Reviews";
import { Events } from "@/components/site/Events";
import { News } from "@/components/site/News";
import { ParentNavigator } from "@/components/site/ParentNavigator";
import { CTA } from "@/components/site/CTA";
import { Contact } from "@/components/site/Contact";
import { EnrollmentForm } from "@/components/site/EnrollmentForm";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { BackToTop } from "@/components/site/BackToTop";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data, visibility } = await getContent();
  return (
    <ContentProvider value={data}>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        {visibility.about && <About />}
        {visibility.programs && <Programs />}
        {visibility.learning && <LearningExperience />}
        {visibility.gallery && <Gallery />}
        {visibility.teachers && <Teachers />}
        {visibility.reviews && <Reviews />}
        {visibility.events && <Events />}
        {visibility.news && <News />}
        <ParentNavigator />
        {visibility.cta && <CTA />}
        {visibility.enrollment && (
          <Suspense fallback={null}>
            <EnrollmentForm />
          </Suspense>
        )}
        {visibility.contacts && <Contact />}
      </main>
      <Footer />
      <MobileCTA />
      <BackToTop />
    </ContentProvider>
  );
}
