import { CTASection } from "@/components/landing-page/CTASection";
import { AboutSection } from "@/components/landing-page/AboutSection";
import { HeroSection } from "@/components/landing-page/HeroSection";
import { Navbar } from "@/components/landing-page/Navbar";
import { ProjectsSection } from "@/components/landing-page/ProjectSection";
import { StatsSection } from "@/components/landing-page/StatsSection";
import { TestimonialsSection } from "@/components/landing-page/TestimonialSection";
import VictoryCourtSection from "@/components/landing-page/VictoryCourtSection";
import { Footer } from "@/components/landing-page/Footer";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        {/* <StatsSection /> */}
        {/* <ProjectsSection /> */}
        <VictoryCourtSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
