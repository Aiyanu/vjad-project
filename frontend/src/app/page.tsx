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
import { InvestorCTASection } from "@/components/landing-page/InvestorCTASection";
import Link from "next/link";
import { Calendar } from "lucide-react";


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
        {/* <TestimonialsSection /> */}
        <InvestorCTASection />
        <CTASection />
        {/* <CTASection2 /> */}
        {/* <CTASection2 /> */}
      </main>
      <Footer />

      {/* Floating Book Appointment Button */}
      <Link href="/appointments">
        <button className="fixed bottom-8 left-8 z-40 flex items-center gap-2 px-6 py-3 bg-vijad-gold text-vijad-dark rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce cursor-pointer hover:bg-vijad-gold/90">
          <Calendar className="w-5 h-5" />
          <span className="font-semibold text-sm sm:text-base">Book Appointment</span>
        </button>
      </Link>
    </div>
  );
}
