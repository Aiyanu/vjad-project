"use client"
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { CountUp } from "./CountUp";

interface StatCardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: LucideIcon;
    description?: string;
    delay?: number;
}

export function StatCard({
    title,
    value,
    prefix,
    suffix,
    icon: Icon,
    description,
    delay = 0
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className="stat-card group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {title}
            </h3>

            <CountUp
                value={value}
                prefix={prefix}
                suffix={suffix}
                className="text-4xl font-display font-bold text-foreground"
            />

            {description && (
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
        </motion.div>
    );
}
