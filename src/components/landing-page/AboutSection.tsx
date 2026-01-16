"use client";

import { motion } from "motion/react";
import { Award, Shield, Target, Lightbulb, Heart, Eye } from "lucide-react";

export function AboutSection() {
    const values = [
        {
            icon: Target,
            title: "Professionalism",
            description:
                "Disciplined execution, continuous improvement, and respect for industry best practices. Our team delivers superior results through collaboration and expertise.",
            circleClasses: "bg-gradient-to-br from-sky-500 to-sky-700",
        },
        {
            icon: Shield,
            title: "Integrity",
            description:
                "Transparency, compliance, and accountability in every transaction. We stand by our commitments and ensure every project meets the highest standards.",
            circleClasses: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        },
        {
            icon: Award,
            title: "Excellence",
            description:
                "Relentless focus on quality, durability, and long-term performance. We set new industry benchmarks with every project we deliver.",
            circleClasses: "bg-gradient-to-br from-[#0046ff] to-[#002583]",
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
                    <span className="gold-badge mb-4">About Vijad Projects</span>
                    <h2 className="section-heading mt-4">A Real Estate Development & Investment Firm</h2>
                    <p className="section-subheading mx-auto max-w-4xl">
                        Vijad Projects is a vertically integrated real estate development and investment firm delivering premium residential projects and secure land opportunities across Lagos. We bridge Nigeria's housing gap by combining quality development, regulatory compliance, and investor-focused execution.
                    </p>
                </motion.div>

                {/* Mission + Vision (side-by-side on md/lg) */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {/* Our Mission */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="card-elegant"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Target className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Our mission is to create exceptional real estate projects that enhance the lives of our customers and contribute to the development of vibrant communities.
                        </p>
                    </motion.div>

                    {/* Our Vision */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="card-elegant"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-vijad-gold/20 text-vijad-gold">
                                <Eye className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            To be the leading real estate brand in the industry, known for our commitment to excellence and quality projects that exceed customer expectations.
                        </p>
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
                    {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-vijad-gold/10 border border-vijad-gold/30 rounded-full text-sm font-medium text-vijad-gold mb-4">
                        What Drives Us
                    </div> */}
                    <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        These principles guide everything we do and define our commitment to you
                    </p>
                </motion.div>

                {/* Core Values Grid */}
                <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3">
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
        </section >
    );
}
