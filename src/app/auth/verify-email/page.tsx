"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

const VerifyEmail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") ?? "";
    const email = searchParams?.get("email") ?? "";

    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(!token);
    const [manualToken, setManualToken] = useState("");
    const [manualEmail, setManualEmail] = useState(email);

    // Automatically verify on mount if token and email are present
    useEffect(() => {
        if (!token && !email) {
            // Neither token nor email - show manual entry
            setShowManualEntry(true);
            setIsLoading(false);
            return;
        }

        if (!token) {
            // Has email but no token - waiting for verification
            setIsLoading(false);
            return;
        }

        const verifyEmail = async () => {
            try {
                setIsLoading(true);

                // Construct URL with query parameters for GET request
                const verifyUrl = new URL("/api/auth/verify", window.location.origin);
                verifyUrl.searchParams.set("token", token);
                verifyUrl.searchParams.set("email", email);

                const verifyRes = await fetch(verifyUrl.toString(), {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const json = await verifyRes.json().catch(() => ({}));

                if (!verifyRes.ok) {
                    setError(json?.error || "Could not verify email");
                    toast.error(json?.error || "Could not verify email");
                    return;
                }

                setIsVerified(true);
                toast.success("Email verified successfully!");

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/auth");
                }, 2000);
            } catch (err) {
                console.error("Verification error:", err);
                setError("An error occurred. Please try again.");
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        // Small delay to ensure params are loaded
        const timer = setTimeout(verifyEmail, 100);
        return () => clearTimeout(timer);
    }, [token, email, router]);

    const handleResendEmail = async () => {
        const emailToResend = manualEmail || email;
        if (!emailToResend) return;

        try {
            setIsResending(true);
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailToResend }),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast.error(json?.error || "Could not resend verification email");
                return;
            }

            toast.success("Verification email sent! Check your inbox.");
        } catch (err) {
            console.error("Resend error:", err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    const handleManualVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualToken || !manualEmail) {
            toast.error("Please enter both email and token");
            return;
        }

        try {
            setIsLoading(true);
            const verifyUrl = new URL("/api/auth/verify", window.location.origin);
            verifyUrl.searchParams.set("token", manualToken);
            verifyUrl.searchParams.set("email", manualEmail);

            const verifyRes = await fetch(verifyUrl.toString(), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const json = await verifyRes.json().catch(() => ({}));

            if (!verifyRes.ok) {
                setError(json?.error || "Could not verify email");
                toast.error(json?.error || "Invalid or expired token");
                return;
            }

            setIsVerified(true);
            toast.success("Email verified successfully!");

            setTimeout(() => {
                router.push("/auth");
            }, 2000);
        } catch (err) {
            console.error("Verification error:", err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <Image
                            src="/vijad-projects-dark.png"
                            width={150}
                            height={70}
                            alt="vjad"
                        />
                    </Link>

                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-16 h-16 mx-auto bg-[var(--color-vjad-gold)]/10 rounded-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-[var(--color-vjad-gold)] animate-spin" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)]">
                                Verifying your email
                            </h2>
                            <p className="text-[var(--color-muted-foreground)]">
                                Please wait while we verify your email address...
                            </p>
                        </motion.div>
                    ) : isVerified ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)]">
                                Email verified!
                            </h2>
                            <p className="text-[var(--color-muted-foreground)]">
                                Your email has been successfully verified. Redirecting to sign in...
                            </p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)]">
                                Verification failed
                            </h2>
                            <p className="text-[var(--color-muted-foreground)]">
                                {error ||
                                    "We couldn't verify your email. The link may have expired."}
                            </p>
                            {email && (
                                <p className="text-sm text-[var(--color-muted-foreground)]">
                                    Email: <span className="font-semibold">{email}</span>
                                </p>
                            )}
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                    Can't find the verification email?
                                </h3>
                                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Check your spam or junk folder</li>
                                    <li>Make sure you're checking the correct email address</li>
                                    <li>Add our email to your contacts to prevent future emails from going to spam</li>
                                    <li>Wait a few minutes - emails can sometimes be delayed</li>
                                </ul>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
                                <Mail className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)]">
                                Verify your email
                            </h2>
                            <p className="text-[var(--color-muted-foreground)]">
                                We've sent a verification email to:
                            </p>
                            {email && (
                                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                                    {email}
                                </p>
                            )}
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                                Please check your email and click the verification link to continue.
                            </p>
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                    Can't find the verification email?
                                </h3>
                                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Check your spam or junk folder</li>
                                    <li>Make sure you're checking the correct email address</li>
                                    <li>Add our email to your contacts to prevent future emails from going to spam</li>
                                    <li>Wait a few minutes - emails can sometimes be delayed</li>
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </div>

                {!isLoading && !isVerified && (
                    <div className="space-y-4">
                        {showManualEntry ? (
                            <form onSubmit={handleManualVerification} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={manualEmail}
                                        onChange={(e) => setManualEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="token">Verification Token</Label>
                                    <Input
                                        id="token"
                                        type="text"
                                        placeholder="Enter the token from your email"
                                        value={manualToken}
                                        onChange={(e) => setManualToken(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !manualToken || !manualEmail}
                                    className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify Email"
                                    )}
                                </Button>
                            </form>
                        ) : null}

                        <Button
                            onClick={handleResendEmail}
                            disabled={isResending}
                            className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] font-semibold"
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-5 w-5 mr-2" />
                                    Resend verification email
                                </>
                            )}
                        </Button>

                        <Link href="/auth">
                            <Button
                                variant="outline"
                                className="w-full h-12"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to login
                            </Button>
                        </Link>
                    </div>
                )}

                {isVerified && (
                    <Link href="/auth">
                        <Button className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] font-semibold">
                            Go to login
                        </Button>
                    </Link>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
