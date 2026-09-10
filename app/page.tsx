import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Programs } from "@/components/site/Programs";
import { LearningExperience } from "@/components/site/LearningExperience";
import { Gallery } from "@/components/site/Gallery";
import { Teachers } from "@/components/site/Teachers";
import { Reviews } from "@/components/site/Reviews";
import { Events } from "@/components/site/Events";
import { ParentNavigator } from "@/components/site/ParentNavigator";
import { CTA } from "@/components/site/CTA";
import { Contact } from "@/components/site/Contact";
import { EnrollmentForm } from "@/components/site/EnrollmentForm";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Programs />
        <LearningExperience />
        <Gallery />
        <Teachers />
        <Reviews />
        <Events />
        <ParentNavigator />
        <CTA />
        <EnrollmentForm />
        <Contact />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
