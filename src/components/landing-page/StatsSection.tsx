"use client"
import { motion } from "motion/react";
import { Users, Building, TrendingUp, Award } from "lucide-react";
import { StatCard } from "./StatCard";

const stats = [
    {
        title: "Active Affiliates",
        value: 547,
        suffix: "+",
        icon: Users,
        description: "Growing every month",
    },
    {
        title: "Properties Listed",
        value: 128,
        icon: Building,
        description: "Across Nigeria",
    },
    {
        title: "Total Sales Value",
        value: 2.4,
        prefix: "₦",
        suffix: "B+",
        icon: TrendingUp,
        description: "In completed transactions",
    },
    {
        title: "Commission Paid",
        value: 95,
        prefix: "₦",
        suffix: "M+",
        icon: Award,
        description: "To our affiliates",
    },
];

export function StatsSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-vijad-gold/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="gold-badge mb-4">Our Impact</span>
                    <h2 className="section-heading mt-4">
                        Numbers That Speak
                    </h2>
                    <p className="section-subheading mx-auto">
                        Our growth reflects the trust our affiliates and clients place in us
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            icon={stat.icon}
                            description={stat.description}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
