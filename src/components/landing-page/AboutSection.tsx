"use client";

import { motion } from "framer-motion";
import { Award, Shield, Target, Lightbulb, Heart } from "lucide-react";

export function AboutSection() {
    const values = [
        {
            icon: Award,
            title: "Excellence",
            description: "Pursuing the highest standards in everything we deliver",
            circleClasses: "bg-gradient-to-br from-[#0046ff] to-[#002583]"
        },
        {
            icon: Shield,
            title: "Integrity",
            description: "Transparency and honesty in all our dealings",
            circleClasses: "bg-gradient-to-br from-emerald-500 to-emerald-600",

        },
        {
            icon: Target,
            title: "Competence",
            description: "Expertise and skill in our industry and craft",
            circleClasses: "bg-gradient-to-br from-amber-500 to-amber-600",

        },
        {
            icon: Lightbulb,
            title: "Creativity & Innovation",
            description: "Fresh ideas and forward-thinking solutions",
            circleClasses: "bg-gradient-to-br from-purple-500 to-purple-600",

        },
        {
            icon: Heart,
            title: "Customer Service",
            description: "Putting your success at the heart of what we do",
            circleClasses: "bg-gradient-to-br from-rose-500 to-rose-600",

        },
    ];

    return (
        <section id="about" className="py-24 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="gold-badge mb-4">About Us</span>
                    <h2 className="section-heading mt-4">Who We Are</h2>
                    <p className="section-subheading mx-auto">
                        VJAD Projects is a premier real estate marketing company dedicated to bridging the gap between
                        quality properties and aspiring homeowners.
                    </p>
                </motion.div>

                {/* Mission + Vision (side-by-side on md/lg) */}
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 border-t">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid gap-8 lg:grid-cols-2 items-start"
                    >
                        {/* Mission */}
                        <div className="py-8 pr-4 border-primary/10">
                            {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-vjad-gold/10 border border-vjad-gold/30 rounded-full text-sm font-medium text-vjad-gold mb-6">
                                Our Purpose
                            </div> */}
                            <h3 className="text-3xl font-bold text-foreground mb-4">Our Mission</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                To revolutionize the real estate industry by connecting exceptional developers with a network of empowered
                                affiliates, delivering premium properties and creating sustainable wealth opportunities for our partners
                                while maintaining the highest standards of integrity and excellence.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="py-8 pl-4 border-primary/10">
                            {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary mb-6">
                                Our Destination
                            </div> */}
                            <h3 className="text-3xl font-bold text-foreground mb-4">Our Vision</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                To become Africa&apos;s leading real estate affiliate platform, known for its innovation, transparency, and
                                commitment to building lasting relationships. We envision a future where quality properties are accessible
                                to more people, and our affiliates thrive as successful entrepreneurs in a supportive ecosystem.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Core Values Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                    className="text-center mt-16 mb-8"
                >
                    {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-vjad-gold/10 border border-vjad-gold/30 rounded-full text-sm font-medium text-vjad-gold mb-4">
                        What Drives Us
                    </div> */}
                    <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        These principles guide everything we do and define our commitment to you
                    </p>
                </motion.div>

                {/* Core Values Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
                    {values.map((v) => {
                        const Icon = v.icon;
                        return (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="group text-center p-6 rounded-2xl border border-border/50 transition-all duration-300 hover:shadow-card-hover bg-card select-none"
                            >
                                <div className="flex justify-center mb-6">
                                    <div
                                        className={`h-16 w-16 rounded-full flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform ${v.circleClasses}`}
                                    >
                                        {/* icon is white by default; gains color on hover using a specific group-hover class */}
                                        <Icon
                                            className={`h-8 w-8 text-white transition-colors duration-300`}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                    {v.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2">{v.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
