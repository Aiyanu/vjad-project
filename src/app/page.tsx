import { CTASection } from "@/components/landing-page/CTASection";
import { AboutSection } from "@/components/landing-page/AboutSection";
import { HeroSection } from "@/components/landing-page/HeroSection";
import { Navbar } from "@/components/landing-page/Navbar";
import { ProjectsSection } from "@/components/landing-page/ProjectSection";
import { StatsSection } from "@/components/landing-page/StatsSection";
import { TestimonialsSection } from "@/components/landing-page/TestimonialSection";
import VictoryCourtSection from "@/components/landing-page/VictoryCourtSection";
import { Footer } from "@/components/landing-page/Footer";
import { CTASection2 } from "@/components/landing-page/CTASection2";
import { TeamSection } from "@/components/landing-page/TeamSection";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        {/* <StatsSection /> */}
        {/* <VictoryCourtSection />
        <VictoryCourtSection /> */}
        {/* <ProjectsSection /> */}
        <TeamSection />
        <TestimonialsSection />
        <CTASection />
        {/* <CTASection2 /> */}
      </main>
      <Footer />
    </div>
  );
}
