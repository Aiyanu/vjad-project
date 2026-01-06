"use client"
import { motion } from "motion/react";
import { ArrowRight, Play, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-hero-gradient" />

            {/* Decorative Elements */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-medium text-white mb-8"
                        >
                            <Shield className="w-4 h-4 text-vjad-gold" />
                            Trusted Real Estate Partner
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 text-white"
                        >
                            {/* <span className="text-vjad-gold"> */}
                            Don’t expect the usual!{" "}
                            {/* </span> */}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-white/80 mb-10 max-w-xl"
                        >
                            Join our exclusive affiliate program and earn generous commissions
                            by connecting buyers with premium real estate opportunities.
                        </motion.p>

                        {/* <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-wrap gap-4 mb-12"
                        >
                            <Button className="bg-white text-secondary hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group">
                                Our Projects
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm group">
                                <Play className="w-5 h-5 mr-2" />
                                Become an Affiliate
                            </Button>
                        </motion.div> */}

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-wrap gap-8"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <Users className="w-5 h-5 text-vjad-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">500+</div>
                                    <div className="text-sm text-white/60">Active Affiliates</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/10">
                                    <TrendingUp className="w-5 h-5 text-vjad-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">₦2B+</div>
                                    <div className="text-sm text-white/60">In Sales</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content - Feature Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="hidden lg:block"
                    >
                        <div className="relative">
                            {/* Main Card */}
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                                <div className="text-white mb-6">
                                    <h3 className="text-2xl font-bold mb-2">Why Partner With Us?</h3>
                                    <p className="text-white/70">
                                        Join Nigeria's fastest-growing real estate affiliate network
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: "Up to 5% Commission", desc: "Industry-leading rates" },
                                        { label: "Instant Tracking", desc: "Real-time dashboard access" },
                                        { label: "Premium Properties", desc: "Exclusive project listings" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-vjad-gold" />
                                            <div>
                                                <div className="font-semibold text-white">{item.label}</div>
                                                <div className="text-sm text-white/60">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-4 -right-4 bg-vjad-gold text-vjad-dark px-6 py-3 rounded-full font-bold shadow-gold-glow"
                            >
                                Join Now – Free!
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path
                        d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
                        className="fill-background"
                    />
                </svg>
            </div>
        </section>
    );
}
