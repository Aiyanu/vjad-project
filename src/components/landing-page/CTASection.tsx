"use client"
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


const benefits = [
    "Commission on completed property sales",
    "Access to verified Vijad Projects listings",
    "Training and marketing support",
    "Transparent performance tracking",
    "Exclusive partner resources",
    "Professional certification program",
];

export function CTASection() {
    const router = useRouter()
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-vijad-gold/5" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-vijad-gold/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-vijad-gold/10 text-vijad-gold rounded-full text-sm font-medium mb-6">
                            <Zap className="w-4 h-4" />
                            Vijad Associate network
                        </div>

                        <h2 className="section-heading mb-4">
                            Earn by Connecting Buyers to{" "}
                            <span className="text-primary">Verified Real Estate Opportunities</span>
                        </h2>

                        <p className="section-subheading mx-auto">
                            The Vijad Associate network is our structured affiliate program designed for professionals and entrepreneurs who want to earn commissions by referring qualified buyers to verified Vijad Projects developments. Partners are supported with training, materials, and transparent tracking.
                        </p>
                    </motion.div>

                    {/* Benefits Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid md:grid-cols-2 gap-4 mb-12"
                    >
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50"
                            >
                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="text-foreground font-medium">{benefit}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 group"
                            onClick={() => router.push("/auth?mode=register")}
                        >
                            Join the Associate network
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-10 py-6"
                            onClick={() => window.location.href = "mailto:support@vijadprojects.com"}
                        >
                            Contact Partner Support
                        </Button>
                    </motion.div>

                    {/* Disclaimer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center text-muted-foreground mt-8 text-sm max-w-2xl mx-auto"
                    >
                        This program operates as a sales partnership channel and does not represent ownership or control of project assets. All commissions are subject to successful property transactions.
                    </motion.p>
                </div>
            </div>
        </section>
    );
}
