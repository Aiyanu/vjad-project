// src/app/auth/forgot-password/page.tsx (or your route)
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import Image from "next/image";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const api = useApi();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const json = await api.post("/api/auth/forgot-password", { email });

            setIsSubmitted(true);
            toast.success("If an account exists, a reset email was sent");
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again later.");
            setError("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <Image src={"/vijad-projects-dark.png"} width={150} height={70} alt="vijad" />
                    </Link>

                    {isSubmitted ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                            <div className="w-16 h-16 mx-auto bg-[var(--color-vijad-gold)]/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-[var(--color-vijad-gold)]" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)]">Check your email</h2>
                            <p className="text-[var(--color-muted-foreground)]">
                                We've sent a password reset link to <br />
                                <span className="font-medium text-[var(--color-foreground)]">{email}</span>
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)] mb-2">Forgot your password?</h2>
                            <p className="text-[var(--color-muted-foreground)]">No worries, we'll send you reset instructions.</p>
                        </>
                    )}
                </div>

                {!isSubmitted && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted-foreground)]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    className={`pl-10 h-12 ${error ? "border-[var(--color-destructive)]" : ""}`}
                                />
                            </div>
                            {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] font-semibold">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                        </Button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link href="/auth" className="inline-flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
