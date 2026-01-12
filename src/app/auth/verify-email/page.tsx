"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import Image from "next/image";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

const VerifyEmail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const api = useApi();
    const token = searchParams?.get("token") ?? "";
    const email = searchParams?.get("email") ?? "";

    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [otp, setOtp] = useState("");
    const [showHelp, setShowHelp] = useState(false);

    // Automatically verify on mount if token and email are present
    useEffect(() => {
        if (!token && !email) {
            // Neither token nor email - show manual entry
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

                const queryParams = new URLSearchParams({ token, email });
                const json = await api.get(`/api/auth/verify?${queryParams.toString()}`);

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

    // Auto-submit when OTP is complete
    useEffect(() => {
        if (otp.length === 6 && email) {
            handleOtpVerification();
        }
    }, [otp, email]);

    const handleResendEmail = async () => {
        if (!email) {
            toast.error("Email address is required");
            return;
        }

        try {
            setIsResending(true);
            const json = await api.post("/api/auth/resend-verification", { email });
            toast.success("Verification email sent! Check your inbox.");
        } catch (err) {
            console.error("Resend error:", err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    const handleOtpVerification = async () => {
        if (!otp || !email) {
            toast.error("Please enter the verification code");
            return;
        }

        try {
            setIsLoading(true);

            const queryParams = new URLSearchParams({ token: otp, email });
            const json = await api.get(`/api/auth/verify?${queryParams.toString()}`);

            setIsVerified(true);
            toast.success("Email verified successfully!");

            setTimeout(() => {
                router.push("/auth");
            }, 2000);
        } catch (err) {
            console.error("Verification error:", err);
            setError("Invalid or expired code");
            toast.error("Invalid or expired code");
            setOtp("");
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
                            alt="vijad"
                        />
                    </Link>

                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-16 h-16 mx-auto bg-[var(--color-vijad-gold)]/10 rounded-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-[var(--color-vijad-gold)] animate-spin" />
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
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="w-16 h-16 mx-auto bg-[var(--color-vijad-gold)]/10 rounded-full flex items-center justify-center">
                                <Mail className="h-8 w-8 text-[var(--color-vijad-gold)]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)] mb-2">
                                    Verify your email
                                </h2>
                                <p className="text-[var(--color-muted-foreground)] mb-1">
                                    We've sent a 6-digit code to:
                                </p>
                                {email && (
                                    <p className="text-sm font-semibold text-[var(--color-foreground)]">
                                        {email}
                                    </p>
                                )}
                            </div>

                            {/* OTP Input Form */}
                            <div className="space-y-4">
                                <div className="flex flex-col items-center space-y-4">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={(value) => setOtp(value)}
                                        disabled={isLoading}
                                        containerClassName="gap-3"
                                    >
                                        <InputOTPGroup className="gap-3">
                                            <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                                            <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                                            <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                                            <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                                            <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                                            <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">
                                        Enter the 6-digit code from your email
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {!isLoading && !isVerified && (
                    <div className="space-y-4">
                        <Button
                            onClick={handleResendEmail}
                            disabled={isResending || !email}
                            variant="outline"
                            className="w-full h-12"
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-5 w-5 mr-2" />
                                    Resend verification code
                                </>
                            )}
                        </Button>

                        {/* Collapsible Help Section */}
                        <Collapsible open={showHelp} onOpenChange={setShowHelp}>
                            <CollapsibleTrigger asChild>
                                <Button
                                    className="w-full text-sm "
                                >
                                    <span>Can't find the verification email?</span>
                                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                                <div className="p-4  border border-blue-200 rounded-lg text-left">
                                    <ul className="text-sm text-blue-800 space-y-2">
                                        <li className="flex items-start gap-2  rounded-md">
                                            <span className=" mt-0.5">•</span>
                                            <span className="">Check your spam or junk folder</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            <span>Make sure you're checking the correct email address</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            <span>Wait a few minutes - emails can sometimes be delayed</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-0.5">•</span>
                                            <span>Add our email to your contacts to prevent future emails from going to spam</span>
                                        </li>
                                    </ul>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Link href="/auth">
                            <Button
                                variant="ghost"
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
