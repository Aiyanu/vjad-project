"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PageProps {
    params: Promise<{ code: string }>;
}

export default function ReferralLinkPage({ params }: PageProps) {
    const router = useRouter();

    useEffect(() => {
        const redirectToRegister = async () => {
            const { code } = await params;

            // Store the referral code in localStorage
            try {
                localStorage.setItem("vjad_ref", code);
            } catch {
                // ignore storage failures (private mode)
            }

            // Redirect to register page with the referral code in query params
            router.push(`/auth?mode=register&ref=${encodeURIComponent(code)}`);
        };

        redirectToRegister();
    }, [params, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-vjad-gold mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
                <p className="text-slate-300">Redirecting you to registration...</p>
            </div>
        </div>
    );
}
