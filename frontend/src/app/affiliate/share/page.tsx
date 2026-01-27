"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Copy,
    CheckCircle,
    Share2,
    MessageCircle,
    Mail,
    Twitter,
    Facebook,
    Linkedin,
    QrCode,
} from "lucide-react";
import { toast } from "sonner";

export default function AffiliateShare() {
    const [referralCode, setReferralCode] = useState("");
    const [commissionRate, setCommissionRate] = useState(15);
    const [copied, setCopied] = useState(false);

    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/ref/${referralCode}` : "";

    useEffect(() => {
        fetchAffiliateData();
    }, []);

    const fetchAffiliateData = async () => {
        try {
            // Use centralized API helper to load current user and referral code
            const api = (await import("@/hooks/useApi")).default();
            const res = await api.get("/api/user");
            if (res?.success && res?.data) {
                setReferralCode(res.data.referralCode || "");
                // commission rate not yet stored on user; default 15
                setCommissionRate(res.data.commissionRate ?? 15);
                // show a welcome message with name if available
                // if (res.data.fullName) {
                //     // eslint-disable-next-line @typescript-eslint/no-floating-promises
                //     import("sonner").then((m) => m.toast.success(`Welcome back, ${res.data.fullName}`));
                // }
            }
        } catch (error) {
            console.error("Error fetching affiliate data:", error);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success("Referral link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Please copy the link manually");
        }
    };

    const shareMessage = `Check out Vijad Projects! Premium real estate investments in Nigeria. Use my referral link: ${referralLink}`;

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "bg-green-500",
            url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
        },
        {
            name: "Twitter",
            icon: Twitter,
            color: "bg-blue-400",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-blue-600",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            color: "bg-blue-700",
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
        },
        {
            name: "Email",
            icon: Mail,
            color: "bg-gray-600",
            url: `mailto:?subject=${encodeURIComponent("Invest in Premium Real Estate with Vijad Projects")}&body=${encodeURIComponent(shareMessage)}`,
        },
    ];

    const tips = [
        {
            title: "Share with your network",
            description: "Post your referral link on social media to reach potential investors",
        },
        {
            title: "Target property seekers",
            description: "Connect with people actively looking for real estate investments",
        },
        {
            title: "Follow up personally",
            description: "Direct conversations often lead to higher conversion rates",
        },
        {
            title: "Highlight project benefits",
            description: "Emphasize location, ROI potential, and vijad's track record",
        },
    ];

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
                    Share & Earn
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Share your referral link and earn {commissionRate}% commission on every sale
                </p>
            </motion.div>

            {/* Referral Link Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-hero-gradient rounded-2xl p-8 text-white"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/20">
                        <Share2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold">Your Referral Link</h2>
                        <p className="text-white/80 text-sm">Share this link to earn commissions</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                    <Input
                        value={referralLink}
                        readOnly
                        className="bg-transparent border-none text-white placeholder:text-white/60 focus-visible:ring-0"
                    />
                    <Button
                        onClick={copyToClipboard}
                        className="bg-white text-[hsl(var(--vijad-navy))] hover:bg-white/90 shrink-0"
                    >
                        {copied ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        <span>Referral Code: <strong className="text-white">{referralCode}</strong></span>
                    </div>
                    <div>
                        Commission Rate: <strong className="text-white">{commissionRate}%</strong>
                    </div>
                </div>
            </motion.div>

            {/* Share Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-elegant"
            >
                <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-4">
                    Share on Social Media
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {shareOptions.map((option) => (
                        <a
                            key={option.name}
                            href={option.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${option.color} text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                        >
                            <option.icon className="h-6 w-6" />
                            <span className="text-sm font-medium">{option.name}</span>
                        </a>
                    ))}
                </div>
            </motion.div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-elegant"
            >
                <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-4">
                    Tips for Success
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    {tips.map((tip, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]"
                        >
                            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1">{tip.title}</h4>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{tip.description}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Commission Structure */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-elegant"
            >
                <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-4">
                    Commission Structure
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[hsl(var(--border))]">
                                <th className="text-left py-3 font-semibold text-[hsl(var(--foreground))]">Property Value</th>
                                <th className="text-left py-3 font-semibold text-[hsl(var(--foreground))]">Commission Rate</th>
                                <th className="text-left py-3 font-semibold text-[hsl(var(--foreground))]">Example Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[hsl(var(--border))]">
                                <td className="py-3 text-[hsl(var(--muted-foreground))]">₦15,000,000 - ₦30,000,000</td>
                                <td className="py-3 text-[hsl(var(--primary))] font-medium">{commissionRate}%</td>
                                <td className="py-3 text-[hsl(var(--foreground))]">₦450,000 - ₦900,000</td>
                            </tr>
                            <tr className="border-b border-[hsl(var(--border))]">
                                <td className="py-3 text-[hsl(var(--muted-foreground))]">₦30,000,000 - ₦75,000,000</td>
                                <td className="py-3 text-[hsl(var(--primary))] font-medium">{commissionRate}%</td>
                                <td className="py-3 text-[hsl(var(--foreground))]">₦900,000 - ₦2,250,000</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-[hsl(var(--muted-foreground))]">₦75,000,000+</td>
                                <td className="py-3 text-[hsl(var(--primary))] font-medium">{commissionRate}%</td>
                                <td className="py-3 text-[hsl(var(--foreground))]">₦2,250,000+</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}