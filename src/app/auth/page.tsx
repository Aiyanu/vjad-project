"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Building2, Loader2 } from "lucide-react";
import { z } from "zod";
import Link from "next/link";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type AuthMode = "login" | "register";

const Auth = () => {
    const searchParams = useSearchParams();
    const initialMode = searchParams?.get("mode") === "register" ? "register" : "login";

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const router = useRouter();

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            // const { data: { session } } = await supabase.auth.getSession();
            // if (session) {
            //     router.push("/affiliate/dashboard");
            // }
        };
        checkUser();

        // const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        //     if (session) {
        //         router.push("/affiliate/dashboard");
        //     }
        // });

        // return () => subscription.unsubscribe();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        try {
            if (mode === "login") {
                loginSchema.parse({ email: formData.email, password: formData.password });
            } else {
                registerSchema.parse(formData);
            }
            setErrors({});
            return true;
        } catch (error) {
            // Zod throws ZodError which has `issues` (not `errors`)
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    // issue.path is an array (e.g. ['email']) — take the first path segment
                    const key = issue.path && issue.path.length > 0 ? String(issue.path[0]) : undefined;
                    if (key) {
                        // Only set the first message per field (keeps behaviour simple)
                        if (!newErrors[key]) newErrors[key] = issue.message;
                    }
                });
                setErrors(newErrors);
            } else {
                // unexpected error; clear errors to be safe
                setErrors({});
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            if (mode === "login") {
                // const { error } = await supabase.auth.signInWithPassword({
                //     email: formData.email,
                //     password: formData.password,
                // });

                // if (error) {
                //     if (error.message.includes("Invalid login credentials")) {
                //         toast.error("Login failed", {
                //             description: "Invalid email or password. Please try again.",
                //         });
                //     } else {
                //         toast.error("Login failed", {
                //             description: error.message,
                //         });
                //     }
                //     return;
                // }

                toast.success("Welcome back!", {
                    description: "You have successfully logged in.",
                });
            } else {
                // Get referral code from cookie/localStorage if present
                const referralCode = typeof window !== "undefined" ? localStorage.getItem("vjad_ref") || undefined : undefined;

                // const { error } = await supabase.auth.signUp({
                //     email: formData.email,
                //     password: formData.password,
                //     options: {
                //         emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/`,
                //         data: {
                //             full_name: formData.fullName,
                //             referred_by: referralCode,
                //         },
                //     },
                // });

                // if (error) {
                //     if (error.message.includes("already registered")) {
                //         toast.error("Account exists", {
                //             description: "An account with this email already exists. Please login instead.",
                //         });
                //         setMode("login");
                //     } else {
                //         toast.error("Registration failed", {
                //             description: error.message,
                //         });
                //     }
                //     return;
                // }

                toast.success("Registration successful!", {
                    description: "Welcome to VJAD Projects! You can now access your affiliate dashboard.",
                });
            }
        } catch (error) {
            toast.error("An error occurred", {
                description: "Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        const newMode = mode === "login" ? "register" : "login";
        setMode(newMode);
        setErrors({});
        setFormData({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        });

        // Update URL to reflect the new mode
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        params.set("mode", newMode);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNNDAgMzBoNHY0aC00ek00NCAyNmg0djRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Link href="/" className="flex items-center gap-3 mb-12">
                            <Building2 className="h-10 w-10 text-white" />
                            <span className="text-2xl font-display font-bold text-white">VJAD Projects</span>
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-display font-bold text-white mb-6 leading-tight">
                            Join Our Elite
                            <br />
                            <span className="text-vjad-gold">Affiliate Network</span>
                        </h1>

                        <p className="text-lg text-white/80 mb-8 max-w-md">
                            Partner with VJAD Projects and earn competitive commissions by connecting buyers with premium real estate opportunities.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Earn up to 3% commission on every sale",
                                "Access exclusive property listings",
                                "Real-time tracking and analytics",
                                "Dedicated affiliate support team",
                            ].map((benefit, index) => (
                                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-vjad-gold" />
                                    <span className="text-white/90">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute top-20 -left-10 w-40 h-40 rounded-full bg-vjad-gold/10 blur-2xl" />
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                    {/* Mobile logo */}
                    <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
                        <Building2 className="h-8 w-8 text-primary" />
                        <span className="text-xl font-display font-bold">VJAD Projects</span>
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-3xl font-display font-bold text-foreground mb-2">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
                        <p className="text-muted-foreground">
                            {mode === "login" ? "Enter your credentials to access your dashboard" : "Start your journey as a VJAD affiliate partner"}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form key={mode} initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }} transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="space-y-5">
                            {mode === "register" && (
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="fullName" name="fullName" type="text" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} className={`pl-10 h-12 ${errors.fullName ? "border-destructive" : ""}`} />
                                    </div>
                                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`} />
                                </div>
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder={mode === "login" ? "Enter your password" : "Create a strong password"} value={formData.password} onChange={handleInputChange} className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            {mode === "register" && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? "border-destructive" : ""}`} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                                </div>
                            )}

                            {mode === "login" && (
                                <div className="flex justify-end">
                                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base">
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><span>{mode === "login" ? "Sign In" : "Create Account"}</span><ArrowRight className="ml-2 h-5 w-5" /></>)}
                            </Button>
                        </motion.form>
                    </AnimatePresence>

                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground">
                            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button onClick={toggleMode} className="text-primary font-semibold hover:underline cursor-pointer">
                                {mode === "login" ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    {mode === "register" && (
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            By creating an account, you agree to our{" "}
                            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Auth;
