import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { AIWorkflow } from "@/components/sections/AIWorkflow";
import { AIPlatform } from "@/components/sections/AIPlatform";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { AgricultureSection } from "@/components/sections/AgricultureSection";
import { HealthcareSection } from "@/components/sections/HealthcareSection";
import { Technology } from "@/components/sections/Technology";
import { Products } from "@/components/sections/Products";
import { Research } from "@/components/sections/Research";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Statistics } from "@/components/sections/Statistics";
import { Testimonials } from "@/components/sections/Testimonials";
import { Partners } from "@/components/sections/Partners";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <AIWorkflow />
        <AIPlatform />
        <DashboardPreview />
        <AgricultureSection />
        <HealthcareSection />
        <Technology />
        <Products />
        <Research />
        <CaseStudies />
        <Statistics />
        <Testimonials />
        <Partners />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
