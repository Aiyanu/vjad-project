"use client"
import { motion } from "motion/react";
import { ArrowRight, Shield, Users, Globe, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection2() {
    return (
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-white">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-medium text-white mb-8">
                            <Shield className="w-4 h-4 text-vijad-gold" />
                            Trusted Real Estate Partner
                        </motion.div>

                        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 text-white">
                            Building value, together
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-white/80 mb-10 max-w-xl">
                            Partner with us for curated real estate opportunities, reliable payouts, and a partner-first approach to growing your business.
                        </motion.p>
                    </div>

                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                            <div className="text-white mb-6">
                                <h3 className="text-2xl font-bold mb-2">Why Partner With Us?</h3>
                                <p className="text-white/70">We make affiliate success simple — tailored support and transparent payouts.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Dedicated Support", desc: "Personal onboarding and a dedicated affiliate manager", icon: Headphones },
                                    { label: "High Conversion Properties", desc: "Curated projects with proven demand", icon: Globe },
                                    { label: "Competitive Payouts", desc: "Transparent and timely commission payments", icon: Users },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-vijad-gold" />
                                        <div>
                                            <div className="font-semibold text-white">{item.label}</div>
                                            <div className="text-sm text-white/60">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
