"use client"
import { motion } from "motion/react";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection2() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-vijad-gold/5" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-vijad-gold/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="gold-badge mb-4">Get In Touch</span>
                        <h2 className="section-heading mt-4 mb-6">
                            Ready to Invest in Your Future?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10">
                            Whether you're looking to buy property, invest in real estate, or join our affiliate program,
                            we're here to help you make the right decision.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">Call Us</h4>
                                    <p className="text-muted-foreground">+234 (0) 123 456 7890</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">Email Us</h4>
                                    <p className="text-muted-foreground">info@vijadprojects.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">Visit Us</h4>
                                    <p className="text-muted-foreground">Lagos, Nigeria</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - CTA Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="bg-secondary rounded-3xl p-10">
                            <h3 className="text-2xl font-bold text-secondary-foreground mb-4">
                                Join Our Affiliate Program
                            </h3>
                            <p className="text-secondary-foreground/70 mb-8">
                                Earn generous commissions by connecting buyers with premium real estate opportunities.
                                Up to 15% commission on every successful sale.
                            </p>

                            <div className="space-y-4 mb-8">
                                {[
                                    "Up to 15% commission on every sale",
                                    "Real-time tracking dashboard",
                                    "Dedicated support team",
                                    "Training and marketing materials",
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-vijad-gold" />
                                        <span className="text-secondary-foreground/80">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="group flex-1">
                                    <Link href="/auth?mode=register">
                                        Become an Affiliate
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="flex-1">
                                    <Link href="#projects">
                                        View Projects
                                    </Link>
                                </Button>
                            </div>

                            <p className="text-center text-secondary-foreground/50 text-sm mt-6">
                                Free to join • No hidden fees • Start earning immediately
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
