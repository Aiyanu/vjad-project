"use client"
import { motion } from "motion/react";
import { Linkedin, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/landing-page/Navbar";
import { Footer } from "@/components/landing-page/Footer";

const team = [
    {
        name: "Victor Jimba",
        role: "MD/CEO",
        image: "/assets/teams/victor-jimba.jpg",
        bio: "Victor Jimba is the CEO of Vijad Projects, a visionary real estate developer with a proven track record of excellence across the business, technology, and real estate sectors. He holds a degree in Human Kinetics and Health Education, as well as certifications in Real Estate Management and Entrepreneurship.",
        linkedin: "https://www.linkedin.com/in/victor-jimba-realor",
    },
    {
        name: "Ayo Afolayan",
        role: "Head of Projects",
        image: "/assets/teams/ayo-afolayan.png",
        bio: "Ayo Afolayan is the Head of Projects at Vijad Projects with over eight years of experience in architecture and project management. He holds both a Bachelor's and a Master's degree in Architecture from Ahmadu Bello University.",
        // linkedin: "https://www.linkedin.com/in/ayo-afolayan",
    },
    {
        name: "Ifeoluwa Odedoyin",
        role: "Head of Legal",
        image: "/assets/teams/ifeoluwa-odedoyin.jpg",
        bio: "Ifeoluwa Odedoyin is an experienced legal practitioner with a strong focus on research and contract drafting. She excels in crafting precise legal agreements and providing strategic solutions for real estate practice.",
        linkedin: "https://www.linkedin.com/in/olufunkeadebayo/",
    },
    {
        name: "Inalegwu Ochoche Aje",
        role: "Chief Operating Officer",
        image: "/assets/teams/inalegwu-ochoche-aje.png",
        bio: "Inalegwu Ochoche Aje is a business executive and legal professional with proven leadership as COO in the real estate sector, where he has driven operational efficiency, corporate growth, and strategic business development.",
        linkedin: "https://www.linkedin.com/in/ochoche-aje-inalegwu-491a15b8",
    },
    {
        name: "Olukayode Badejo",
        role: "Digital Marketing Manager",
        image: "/assets/teams/olukayode-badejo.png",
        bio: "Meet Olukayode Badejo, a multifaceted professional with a passion for leveraging digital marketing, copywriting, customer experience, and transformational leadership to drive business growth. As a seasoned Digital Marketing Consultant, Olukayode harnesses the power of revolutionary digital tools to create effective marketing and sales strategies for businesses, enabling companies to thrive in the competitive online landscape and strengthening Vijad Projects online presence.",
        linkedin: "https://www.linkedin.com/in/olukayode-badejo-715635127",
    },
    {
        name: "Favour Olalude",
        role: "Head of HR and Administration",
        image: "/assets/teams/favour-olalude.png",
        bio: "Favour Olalude is the Head of Human Resources and Administration at Vijad Projects Limited, where she supports team development, improves internal processes, and ensures brand consistency across the company. With a growing track record in HR and administration, she focuses on building a healthy work culture and aligning administrative structures with the company's values. Her approach combines people-focused practices with a strong sense of organization.",
        linkedin: "https://www.linkedin.com/in/favour-olalude-7a9483273",
    }
];

export default function TeamPage() {
    const firstRow = team.slice(0, Math.min(team.length, 4));
    const secondRow = team.slice(4);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24">
                {/* Hero Section */}
                <section className="relative py-16 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <span className="gold-badge mb-4">Meet Our Team</span>
                            <h1 className="section-heading mt-4">
                                Leadership Team
                            </h1>
                            <p className="section-subheading mx-auto max-w-3xl">
                                Vijad Projects' success is driven by a diverse and experienced team of professionals who bring together expertise from various fields
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Team Grid Section */}
                <section className="py-24 bg-background relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                    <div className="container mx-auto px-4">
                        {/* First row: show 4 items on large screens */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {firstRow.map((member, index) => (
                                <motion.div
                                    key={member.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group"
                                >
                                    <div className="relative rounded-3xl overflow-hidden mb-6">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Social Link (only show if LinkedIn is provided) */}
                                        {member.linkedin && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-vijad-gold transition-colors"
                                                    aria-label={`Visit ${member.name}'s LinkedIn profile`}
                                                >
                                                    <Linkedin className="w-5 h-5 text-primary" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                                        <p className="text-primary font-medium mb-3">{member.role}</p>
                                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Second row: center remaining items (usually 2) */}
                        {secondRow.length > 0 && (
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                                {secondRow.map((member, idx) => (
                                    <motion.div
                                        key={member.name}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: (firstRow.length + idx) * 0.1 }}
                                        className={"group lg:col-span-1 " + (idx === 0 ? "lg:col-start-2" : "lg:col-start-3")}
                                    >
                                        <div className="relative rounded-3xl overflow-hidden mb-6">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Social Link (only show if LinkedIn is provided) */}
                                            {member.linkedin && (
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <a
                                                        href={member.linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-vijad-gold transition-colors"
                                                        aria-label={`Visit ${member.name}'s LinkedIn profile`}
                                                    >
                                                        <Linkedin className="w-5 h-5 text-primary" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                                            <p className="text-primary font-medium mb-3">{member.role}</p>
                                            <p className="text-sm text-muted-foreground">{member.bio}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
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
