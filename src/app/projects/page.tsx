import { ProjectsSection } from "@/components/landing-page/ProjectSection";
import { Navbar } from "@/components/landing-page/Navbar";
import { Footer } from "@/components/landing-page/Footer";

export default function ProjectsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="py-16">
                <ProjectsSection />
            </main>
            <Footer />
        </div>
    );
}
