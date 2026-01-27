import { ProjectsSection } from "@/components/landing-page/ProjectSection";
import { Navbar } from "@/components/landing-page/Navbar";
import { Footer } from "@/components/landing-page/Footer";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function ProjectsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="py-16">
                <ProjectsSection />
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
