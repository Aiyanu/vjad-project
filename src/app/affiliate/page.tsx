"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { useAppSelector } from "@/store/hooks";

import { StatCard } from "@/components/landing-page/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    Users,
    DollarSign,
    TrendingUp,
    Share2,
    ArrowRight,
    Copy,
    CheckCircle,
    Loader2,
} from "lucide-react";

const AffiliateDashboard = () => {
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState("");
    const [totalReferrals, setTotalReferrals] = useState(0);
    const [loading, setLoading] = useState(true);
    const user = useAppSelector((state) => state.auth.user);
    const referralCode = user?.referralCode || "";

    useEffect(() => {
        if (typeof window !== "undefined") setOrigin(window.location.origin);
    }, []);

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                const res = await fetch("/api/affiliate/referrals", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setTotalReferrals(data.referrals?.length || 0);
                }
            } catch (err) {
                console.error("Failed to fetch referrals:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReferrals();
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

    const userName = user?.fullName || "Partner";

    const stats = [
        { title: "Total Referrals", value: loading ? 0 : totalReferrals, icon: Users },
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
                            <p className="text-white/80 text-sm">Earn 15% commission on every successful referral</p>
                        </div>

                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-white/60 mb-1">Your Referral Code</span>
                                <code className="text-lg font-mono font-bold tracking-wider">{referralCode || "N/A"}</code>
                            </div>

                            <Button
                                size="sm"
                                onClick={copyToClipboard}
                                className="bg-white text-[var(--color-vjad-navy)] hover:bg-white/90 shrink-0"
                                aria-label="Copy referral link"
                            >
                                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}>
                            <StatCard {...stat} />
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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

                {/* <VerifiedAffiliatesCard /> */}
            </div>
        </>
    );
};

export default AffiliateDashboard;

function VerifiedAffiliatesCard() {
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopAffiliates = async () => {
            try {
                const res = await fetch("/api/admin/affiliates");
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                // Expecting an array of affiliates; pick first 3 verified
                const verified = (json?.affiliates || json || []).filter((a: any) => a.is_active || a.emailVerified).slice(0, 3);
                setAffiliates(verified);
            } catch (err) {
                console.warn("Could not fetch affiliates", err);
                setAffiliates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopAffiliates();
    }, []);

    return (
        <motion.div className="card-elegant" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
            <h3 className="font-display font-bold text-lg mb-4">Top Verified Affiliates</h3>
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : affiliates.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                    <Share2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No verified affiliates yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {affiliates.map((a) => (
                        <div key={a.id} className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{a.fullName || a.email}</div>
                                <div className="text-sm text-[var(--color-muted-foreground)]">{a.phone || "No phone"}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={a.emailVerified ? "default" : "secondary"}>
                                    {a.emailVerified ? "Verified" : "Unverified"}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
