"use client"
import { motion } from "motion/react";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function InvestorCTASection() {
    return (
        <section className="py-20 bg-gradient-to-br from-primary/5 to-vijad-gold/5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-vijad-gold/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                        Looking to Invest or Own Property in Lagos?
                    </h2>

                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Speak with our team to explore verified real estate opportunities designed for growth, security, and long-term value.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 group"
                        >
                            <Link href="/appointments">
                                <Calendar className="w-5 h-5 mr-2" />
                                Schedule a Consultation
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-6"
                        >
                            <Link href="/projects">
                                View Our Projects
                            </Link>
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6">
                        Verified titles • Regulatory compliance • Professional service
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
