"use client"
import { motion } from "motion/react";
import { Linkedin } from "lucide-react";

const team = [
    {
        name: "Victor Jimba",
        role: "MD/CEO",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        bio: "Victor Jimba is the CEO of VJAD Projects, a visionary real estate developer with a proven track record of excellence across the business, technology, and real estate sectors. He holds a degree in Human Kinetics and Health Education, as well as certifications in Real Estate Management and Entrepreneurship.",
    },
    {
        name: "Ayo Afolayan",
        role: "Head of Projects",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
        bio: "Ayo Afolayan is the Head of Projects at VJAD Projects with over eight years of experience in architecture and project management. He holds both a Bachelor's and a Master's degree in Architecture from Ahmadu Bello University.",
    },
    {
        name: "Ifeoluwa Odedoyin",
        role: "Head of Legal",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
        bio: "Ifeoluwa Odedoyin is an experienced legal practitioner with a strong focus on research and contract drafting. She excels in crafting precise legal agreements and providing strategic solutions for real estate practice.",
    },
    {
        name: "Inalegwu Ochoche Aje",
        role: "Chief Operating Officer",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
        bio: "Inalegwu Ochoche Aje is a business executive and legal professional with proven leadership as COO in the real estate sector, where he has driven operational efficiency, corporate growth, and strategic business development.",
    },
];

export function TeamSection() {
    return (
        <section id="team" className="py-24 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="gold-badge mb-4">Meet Our Team</span>
                    <h2 className="section-heading mt-4">
                        Leadership Team
                    </h2>
                    <p className="section-subheading mx-auto">
                        VJAD Projects' success is driven by a diverse and experienced team of professionals who bring together expertise from various fields
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, index) => (
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

                                {/* Social Link */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-vjad-gold transition-colors">
                                        <Linkedin className="w-5 h-5 text-primary" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                                <p className="text-primary font-medium mb-3">{member.role}</p>
                                <p className="text-sm text-muted-foreground line-clamp-3">{member.bio}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
