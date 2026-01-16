"use client"
import { motion } from "motion/react";
import { MapPin, Ruler, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
    {
        id: 1,
        title: "Victory Court",
        location: "Iloti Epe-Ijebu Ode Express",
        description: "Now Introducing Victory Court - ESTD 2024",
        image: "/assets/projects/victory-court.jpg",
        status: "Now Introducing",
        cofo: "IJO/SL/C50",
        features: [
            "Title",
            "24/7 Security",
            "Road Network",
            "Swimming Pool",
            "Perimeter Fence",
            "Streetlight",
        ],
        size: "300 & 500 SQM",
    },
    {
        id: 2,
        title: "Beryls Prime",
        location: "Lekki Peninsula 2 GRA",
        description: "2 Bedroom with BQ - Now Selling!",
        image: "/assets/projects/beryls.jpg",
        status: "Now Selling",
        cofo: "ET2025(IKT)/DO/222/70",
        features: [
            "Ample Parking",
            "Security",
            "Title",
            "Gym",
            "Concierge",
            "Smart Features",
        ],
        price: "N95M",
        initialDeposit: "N30M",
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
                        Our Real Estate Developments
                    </h2>
                    <p className="section-subheading mx-auto max-w-3xl">
                        Explore our ongoing and upcoming real estate projects, carefully selected for strategic location, secure titles, and long-term value creation.
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
                                        <div className="absolute top-4 right-4 px-4 py-2 bg-vijad-gold text-vijad-dark text-sm font-bold rounded-full flex items-center gap-2">
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
                                    {project.size && <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
                                        <Ruler className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">{project.size}</span>
                                    </div>}
                                    {project.cofo && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
                                            <Shield className="w-4 h-4 text-vijad-gold" />
                                            <span className="text-sm font-medium">{project.cofo}</span>
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

                                {/* <Button size="lg" className="group">
                                    Learn More
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button> */}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
