// src/app/auth/reset-password/page.tsx (or wherever ResetPassword lives)
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

const passwordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

const ResetPassword = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const api = useApi();
    const token = searchParams?.get("token") ?? "";
    const emailParam = searchParams?.get("email") ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // If token or email missing, we could redirect back or show a message
        if (!token || !emailParam) {
            // leave the UI — attempt will fail with server error if missing
        }
    }, [token, emailParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            passwordSchema.parse({ password, confirmPassword });
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                err.issues.forEach((issue) => {
                    const key = issue.path?.[0] ? String(issue.path[0]) : undefined;
                    if (key && !newErrors[key]) newErrors[key] = issue.message;
                });
                setErrors(newErrors);
                return;
            }
        }

        setIsLoading(true);
        try {
            const json = await api.post("/api/auth/reset", { email: emailParam, token, password });

            setIsSuccess(true);
            toast.success("Password reset successful");
            // optional: redirect to login after short delay
            setTimeout(() => router.push("/auth"), 1200);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again later.");
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

                    {isSuccess ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                            <div className="w-16 h-16 mx-auto bg-[var(--color-vijad-gold)]/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-[var(--color-vijad-gold)]" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)]">Password updated!</h2>
                            <p className="text-[var(--color-muted-foreground)]">Your password has been successfully reset. Redirecting to sign in…</p>
                        </motion.div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-display font-bold text-[var(--color-foreground)] mb-2">Set new password</h2>
                            <p className="text-[var(--color-muted-foreground)]">Your new password must be at least 8 characters.</p>
                        </>
                    )}
                </div>

                {!isSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted-foreground)]" />
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} className={`pl-10 pr-10 h-12 ${errors.password ? "border-[var(--color-destructive)]" : ""}`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-[var(--color-destructive)]">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted-foreground)]" />
                                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? "border-[var(--color-destructive)]" : ""}`} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-[var(--color-destructive)]">{errors.confirmPassword}</p>}
                        </div>

                        {errors.form && <p className="text-sm text-[var(--color-destructive)]">{errors.form}</p>}

                        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] font-semibold">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                        </Button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
