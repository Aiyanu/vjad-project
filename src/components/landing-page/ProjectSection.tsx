"use client"
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Square, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
    {
        id: 1,
        title: "Emerald Gardens Estate",
        location: "Lekki Phase 2, Lagos",
        price: "₦45M",
        beds: 4,
        baths: 3,
        sqft: "350 sqm",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        status: "Selling Fast",
        commission: "5%",
    },
    {
        id: 2,
        title: "Royal Palms Residence",
        location: "Ajah, Lagos",
        price: "₦28M",
        beds: 3,
        baths: 2,
        sqft: "220 sqm",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
        status: "New Launch",
        commission: "4%",
    },
    {
        id: 3,
        title: "Victoria Heights",
        location: "Ikoyi, Lagos",
        price: "₦120M",
        beds: 5,
        baths: 5,
        sqft: "500 sqm",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        status: "Premium",
        commission: "3%",
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
                    <span className="gold-badge mb-4">Our Properties</span>
                    <h2 className="section-heading mt-4">
                        Featured Projects
                    </h2>
                    <p className="section-subheading mx-auto">
                        Explore our curated selection of premium properties ready for you to
                        market and earn commissions on every successful sale.
                    </p>
                </motion.div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group bg-card rounded-3xl overflow-hidden border border-border/50 shadow-elegant hover:shadow-card-hover transition-all duration-500"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Status Badge */}
                                <div className="absolute top-4 left-4 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                                    {project.status}
                                </div>

                                {/* Commission Badge */}
                                <div className="absolute top-4 right-4 px-4 py-1.5 bg-vjad-gold text-vjad-dark text-sm font-bold rounded-full">
                                    {project.commission} Commission
                                </div>

                                {/* Price */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="text-3xl font-bold text-white">{project.price}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {project.title}
                                </h3>

                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">{project.location}</span>
                                </div>

                                {/* Features */}
                                <div className="flex items-center gap-4 pb-4 border-b border-border mb-4">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Bed className="w-4 h-4" />
                                        <span>{project.beds} Beds</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Bath className="w-4 h-4" />
                                        <span>{project.baths} Baths</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Square className="w-4 h-4" />
                                        <span>{project.sqft}</span>
                                    </div>
                                </div>

                                <Button className="w-full group/btn" variant="outline">
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center mt-12"
                >
                    <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                        View All Projects
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
