import { CTASection } from "@/components/landing-page/CTASection";
import { AboutSection } from "@/components/landing-page/AboutSection";
import { HeroSection } from "@/components/landing-page/HeroSection";
import { Navbar } from "@/components/landing-page/Navbar";
import { ProjectsSection } from "@/components/landing-page/ProjectSection";
import { StatsSection } from "@/components/landing-page/StatsSection";
import { TestimonialsSection } from "@/components/landing-page/TestimonialSection";
import { Footer } from "react-day-picker";
import VictoryCourtSection from "@/components/landing-page/VictoryCourtSection";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <StatsSection />
        {/* <ProjectsSection /> */}
        <VictoryCourtSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <footer className="bg-slate-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <h3 className="font-bold mb-4">About VJAD</h3>
              <p className="text-slate-400 text-sm">Premium real estate platform connecting buyers and affiliates.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Affiliate Program
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <p className="text-sm text-slate-400">support@vjadprojects.com</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-slate-400 text-sm">&copy; {new Date().getFullYear()} VJAD Projects. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
