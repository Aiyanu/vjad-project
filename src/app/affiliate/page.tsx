"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast, Toaster } from "sonner";

import { StatCard } from "@/components/landing-page/StatCard";
import { Button } from "@/components/ui/button";

import {
    Users,
    DollarSign,
    TrendingUp,
    Share2,
    ArrowRight,
    Copy,
    CheckCircle,
} from "lucide-react";

const AffiliateDashboard = () => {
    const [referralCode, setReferralCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        // supabase session logic intentionally commented
        // set a demo code for now
        setReferralCode("VJAD2025");

        if (typeof window !== "undefined") setOrigin(window.location.origin);
    }, []);

    const referralLink = `${origin}/ref/${referralCode}`;

    const copyToClipboard = async () => {
        try {
            if (!referralLink) {
                toast("No referral link available");
                return;
            }
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success("Referral link copied", { description: "You can now share your link" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Copy failed", { description: "Please copy the link manually" });
        }
    };

    const userName = "Partner";

    const stats = [
        { title: "Total Referrals", value: 24, icon: Users },
        { title: "Converted Sales", value: 8, icon: TrendingUp },
        { title: "Commission Earned", value: 45000, icon: DollarSign, prefix: "₦" },
        { title: "Pending Payout", value: 12500, icon: DollarSign, prefix: "₦" },
    ];

    return (
        <>
            {/* Sonner Toaster — include once in app layout instead if you prefer */}
            <Toaster position="top-right" />

            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl font-display font-bold text-[var(--color-foreground)]">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-[var(--color-muted-foreground)] mt-1">Here's an overview of your affiliate performance</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-hero-gradient rounded-2xl p-6 text-white"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-display font-bold mb-1">Share & Earn Commission</h2>
                            <p className="text-white/80 text-sm">Earn up to 3% on every successful referral</p>
                        </div>

                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 pl-4">
                            <span className="text-sm truncate max-w-[220px]">{referralLink || "No link yet"}</span>

                            <Button
                                size="sm"
                                onClick={copyToClipboard}
                                className="bg-white text-[var(--color-vjad-navy)] hover:bg-white/90"
                                aria-label="Copy referral link"
                            >
                                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}>
                            <StatCard {...stat} />
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div className="card-elegant" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                        <h3 className="font-display font-bold text-lg">Report a Sale</h3>
                        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Submit a new sale for verification</p>

                        <Link href="/affiliate/sales" className="block mt-4 w-full sm:w-auto">
                            <Button className="w-full sm:w-auto flex items-center justify-center">
                                Report Sale <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div className="card-elegant" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                        <h3 className="font-display font-bold text-lg">View Referrals</h3>
                        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Track your referral conversions</p>

                        <Link href="/affiliate/referrals" className="block mt-4 w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                <motion.div className="card-elegant" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
                    <h3 className="font-display font-bold text-lg mb-4">Recent Activity</h3>
                    <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                        <Share2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No recent activity yet</p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default AffiliateDashboard;
