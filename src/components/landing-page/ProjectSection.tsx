"use client"
import { motion } from "motion/react";
import { MapPin, Ruler, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
    {
        id: 1,
        title: "Victory Court Estate",
        location: "Near Yaba Tech Epe Campus, Isimi Lagos & Epe Toll Gate",
        description: "Victory Court Estate is a burgeoning residential and commercial development poised for growth and excellence, sitting on 20 acres.",
        image: "/flyer.jpg",
        status: "Ongoing",
        cofo: "IJO/SL/C 133",
        features: [
            "C of O Verified",
            "Fenced & Gated",
            "Upcoming infrastructure development",
            "Potential for capital appreciation",
            "Secure and serene environment",
        ],
        size: "300sqm - 600sqm",
    },
    {
        id: 2,
        title: "Beryls Prime",
        location: "Lekki Peninsula II",
        description: "This is a premium development of 12 units of luxury 2-Bedroom apartments with BQ. A perfect blend of modern living and investment opportunity.",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
        status: "Ongoing",
        features: [
            "Luxury 2-Bedroom Apartments",
            "Boys Quarter (BQ)",
            "Premium Finishes",
            "Strategic Location",
            "High ROI Potential",
        ],
        size: "960sqm Land",
    },
];

export function ProjectsSection() {
    return (
        <section id="projects" className="py-24 bg-muted/50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="gold-badge mb-4">Our Projects</span>
                    <h2 className="section-heading mt-4">
                        Traction & Milestones
                    </h2>
                    <p className="section-subheading mx-auto">
                        Explore our ongoing developments that showcase our commitment to quality and excellence in real estate
                    </p>
                </motion.div>

                {/* Projects */}
                <div className="space-y-16">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                                }`}
                        >
                            {/* Image */}
                            <div className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                <div className="relative rounded-3xl overflow-hidden shadow-elegant">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full aspect-[4/3] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                                        {project.status}
                                    </div>

                                    {/* C of O Badge */}
                                    {project.cofo && (
                                        <div className="absolute top-4 right-4 px-4 py-2 bg-vjad-gold text-vjad-dark text-sm font-bold rounded-full flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            C of O Verified
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    {project.title}
                                </h3>

                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span>{project.location}</span>
                                </div>

                                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                    {project.description}
                                </p>

                                {/* Key Info */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
                                        <Ruler className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">{project.size}</span>
                                    </div>
                                    {project.cofo && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
                                            <Shield className="w-4 h-4 text-vjad-gold" />
                                            <span className="text-sm font-medium">C of O: {project.cofo}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-8">
                                    <h4 className="font-semibold text-foreground">Key Features:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {project.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button size="lg" className="group">
                                    Learn More
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
