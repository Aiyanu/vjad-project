"use client"
import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, Building2, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

const passwordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    // const { toast } = useToast();
    const router = useRouter();

    // useEffect(() => {
    //     // Check if we have a valid session from the reset link
    //     const checkSession = async () => {
    //         const { data: { session } } = await supabase.auth.getSession();
    //         if (!session) {
    //             toast({
    //                 title: "Invalid or expired link",
    //                 description: "Please request a new password reset link.",
    //                 variant: "destructive",
    //             });
    //             navigate("/forgot-password");
    //         }
    //     };
    //     checkSession();
    // }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // setErrors({});

        // try {
        //     passwordSchema.parse({ password, confirmPassword });
        // } catch (err) {
        //     if (err instanceof z.ZodError) {
        //         const newErrors: Record<string, string> = {};
        //         err.errors.forEach((error) => {
        //             if (error.path[0]) {
        //                 newErrors[error.path[0] as string] = error.message;
        //             }
        //         });
        //         setErrors(newErrors);
        //         return;
        //     }
        // }

        // setIsLoading(true);

        // try {
        //     const { error } = await supabase.auth.updateUser({
        //         password: password,
        //     });

        //     if (error) {
        //         toast({
        //             title: "Error",
        //             description: error.message,
        //             variant: "destructive",
        //         });
        //         return;
        //     }

        //     setIsSuccess(true);

        //     // Redirect to dashboard after 3 seconds
        //     setTimeout(() => {
        //         navigate("/affiliate/dashboard");
        //     }, 3000);
        // } catch (error) {
        //     toast({
        //         title: "An error occurred",
        //         description: "Please try again later.",
        //         variant: "destructive",
        //     });
        // } finally {
        //     setIsLoading(false);
        // }
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

                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-[hsl(var(--foreground))]">
                                Password updated!
                            </h2>
                            <p className="text-[hsl(var(--muted-foreground))]">
                                Your password has been successfully reset.<br />
                                Redirecting to dashboard...
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-display font-bold text-[hsl(var(--foreground))] mb-2">
                                Set new password
                            </h2>
                            <p className="text-[hsl(var(--muted-foreground))]">
                                Your new password must be at least 8 characters.
                            </p>
                        </>
                    )}
                </div>

                {!isSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-10 pr-10 h-12 ${errors.password ? "border-[hsl(var(--destructive))]" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-[hsl(var(--destructive))]">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? "border-[hsl(var(--destructive))]" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-[hsl(var(--destructive))]">{errors.confirmPassword}</p>
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
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
