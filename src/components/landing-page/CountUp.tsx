"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, motion } from "motion/react";

interface CountUpProps {
    value: number;
    decimals?: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    formatFn?: (value: number) => string;
}

export function CountUp({
    value,
    decimals = 0,
    duration = 2,
    prefix = "",
    suffix = "",
    className = "",
    formatFn,
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Check for reduced motion preference
    const prefersReducedMotion =
        typeof window !== "undefined"
            ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
            : false;

    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
        duration: duration * 1000,
    });

    useEffect(() => {
        if (isInView) {
            if (prefersReducedMotion) {
                motionValue.set(value);
            } else {
                motionValue.set(value);
            }
        }
    }, [isInView, value, motionValue, prefersReducedMotion]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                const formatted = formatFn
                    ? formatFn(latest)
                    : new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    }).format(latest);
                ref.current.textContent = `${prefix}${formatted}${suffix}`;
            }
        });
        return unsubscribe;
    }, [springValue, decimals, prefix, suffix, formatFn]);

    // Set initial value
    const initialFormatted = formatFn
        ? formatFn(prefersReducedMotion ? value : 0)
        : new Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(prefersReducedMotion ? value : 0);

    return (
        <motion.span
            ref={ref}
            className={className}
            aria-live="polite"
            aria-label={`${prefix}${value}${suffix}`}
        >
            {prefix}{initialFormatted}{suffix}
        </motion.span>
    );
}
