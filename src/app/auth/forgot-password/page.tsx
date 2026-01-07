"use client"
import { useState } from "react";
import { motion } from "framer-motion";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Building2, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";

const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        //     try {
        //         emailSchema.parse({ email });
        //     } catch (err) {
        //         if (err instanceof z.ZodError) {
        //             setError(err.errors[0].message);
        //             return;
        //         }
        //     }

        //     setIsLoading(true);

        //     try {
        //         // const { error } = await supabase.auth.resetPasswordForEmail(email, {
        //         //     redirectTo: `${window.location.origin}/reset-password`,
        //         // });

        //         if (error) {
        //             toast({
        //                 title: "Error",
        //                 description: error.message,
        //                 variant: "destructive",
        //             });
        //             return;
        //         }

        //         setIsSubmitted(true);
        //     } catch (error) {
        //         toast({
        //             title: "An error occurred",
        //             description: "Please try again later.",
        //             variant: "destructive",
        //         });
        //     } finally {
        //         setIsLoading(false);
        //     }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />
                        <span className="text-xl font-display font-bold">VJAD Projects</span>
                    </Link>

                    {isSubmitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[hsl(var(--foreground))]">
                                Check your email
                            </h2>
                            <p className="text-[hsl(var(--muted-foreground))]">
                                We've sent a password reset link to<br />
                                <span className="font-medium text-[hsl(var(--foreground))]">{email}</span>
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-display font-bold text-[hsl(var(--foreground))] mb-2">
                                Forgot your password?
                            </h2>
                            <p className="text-[hsl(var(--muted-foreground))]">
                                No worries, we'll send you reset instructions.
                            </p>
                        </>
                    )}
                </div>

                {!isSubmitted && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    className={`pl-10 h-12 ${error ? "border-[hsl(var(--destructive))]" : ""}`}
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link
                        href="/auth"
                        className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
