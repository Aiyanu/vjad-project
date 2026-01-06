"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VictoryCourtSection() {
    return (
        <section id="projects" className="py-24 bg-muted/50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="gold-badge mb-4 uppercase tracking-wide">Now Introducing</div>

                    <h2 className="section-heading mt-4">Victory Court</h2>

                    <p className="section-subheading mx-auto">
                        Our Flagship Development Project
                    </p>
                </motion.div>

                {/* Content Grid — image slightly larger than content */}
                <div className="grid gap-12 items-stretch lg:grid-cols-[55%_45%]">
                    {/* Image column — replace your current motion.div for image with this */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative group rounded-3xl overflow-hidden"
                    >
                        {/* halo */}
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/6 via-vjad-gold/6 to-secondary/6 opacity-80 blur-3xl pointer-events-none transition-opacity group-hover:opacity-90" />

                        {/* single positioned container with explicit height */}
                        <div className="relative w-full h-80 md:h-[480px] lg:h-full rounded-3xl overflow-hidden bg-card border border-border/50 shadow-elegant">
                            <Image
                                src="/flyer.jpg"                  // ensure file exists in public/
                                alt="Victory Court - Premium real estate development project"
                                fill
                                priority
                                style={{ objectFit: "cover" }}   // robust object-fit
                                className="absolute inset-0 w-full h-full transform-gpu group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* subtle overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </motion.div>


                    {/* Text column */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col justify-center"
                    >
                        <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                            Premium Residential Excellence
                        </h3>

                        <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                            Victory Court represents the pinnacle of modern real estate development. Strategically located on the
                            Iloti Epe–Ijebu Ode Express corridor, this premium estate blends contemporary architecture with long-term
                            investment value.
                        </p>

                        {/* Features (theme colors) */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-medium text-foreground">Available in 300 &amp; 500 SQM</h4>
                                    <p className="text-sm text-muted-foreground">Flexible plot sizes to suit your needs</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-medium text-foreground">Prime Accessibility</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Just 5 minutes from the Epe Toll Gate and 15 minutes from Alaro City and the proposed airport.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-medium text-foreground">Land Title</h4>
                                    <p className="text-sm text-muted-foreground">C of O in view — FILE NO: IJO/SL/C50</p>
                                </div>
                            </div>
                        </div>

                        {/* Location + Landmarks */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-foreground mb-3">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="font-medium">Iloti Epe — Ijebu Ode Road</span>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <div className="font-medium text-foreground mb-2">Nearby Landmarks</div>
                                <ul className="grid sm:grid-cols-2 gap-1">
                                    <li>• LASUED</li>
                                    <li>• Yaba Tech</li>
                                    <li>• Vanguard Academy</li>
                                    <li>• St Augustine University</li>
                                    <li>• Michael Otedola Housing Estate</li>
                                    <li>• Epe Toll Gate</li>
                                    <li>• And many more…</li>
                                </ul>
                            </div>
                        </div>

                        {/* <Link href="/register" className="inline-block">
                            <Button size="lg" className="bg-primary hover:bg-secondary text-primary-foreground font-medium px-6">
                                Explore Victory Court
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link> */}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
