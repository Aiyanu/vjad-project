"use client"
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
    "Up to 5% commission on every sale",
    "Real-time tracking dashboard",
    "Dedicated support team",
    "Training and marketing materials",
    "Exclusive property access",
    "Monthly bonus incentives",
];

export function CTASection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-vjad-gold/5" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-vjad-gold/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                            <Zap className="w-4 h-4" />
                            Start Earning Today
                        </div>

                        <h2 className="section-heading mb-4">
                            Ready to Build Your{" "}
                            <span className="text-primary">Real Estate Empire?</span>
                        </h2>

                        <p className="section-subheading mx-auto">
                            Join our affiliate program and unlock unlimited earning potential.
                            No experience required — we provide everything you need to succeed.
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
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 group">
                            Register as Affiliate
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                            Contact Sales Team
                        </Button>
                    </motion.div>

                    {/* Trust Badge */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center text-muted-foreground mt-8"
                    >
                        Free to join • No hidden fees • Start earning immediately
                    </motion.p>
                </div>
            </div>
        </section>
    );
}
