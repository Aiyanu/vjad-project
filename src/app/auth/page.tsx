// src/app/auth/page.tsx (or wherever your Auth component lives)
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { useAppDispatch } from "@/store/hooks";
import { setToken } from "@/store/globalSlice";
import { setUser } from "@/store/userSlice";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import Image from "next/image";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
    .object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type AuthMode = "login" | "register";
type RegistrationStep = 1 | 2 | 3;

const Auth = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const api = useApi();
    const initialMode = searchParams?.get("mode") === "register" ? "register" : "login";

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [referrerName, setReferrerName] = useState<string | null>(null);

    // Bank details for registration
    const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
    const [bankCode, setBankCode] = useState<string>("");
    const [bankName, setBankName] = useState<string>("");
    const [accountNumber, setAccountNumber] = useState<string>("");
    // const [accountName, setAccountName] = useState<string>("");
    // const [accountVerified, setAccountVerified] = useState(false);
    // const [verifyingAccount, setVerifyingAccount] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        referralCode: "",
    });

    // Save referral if present in URL and fetch referrer info
    useEffect(() => {
        const ref = searchParams?.get("ref");
        if (ref) {
            try {
                sessionStorage.setItem("vijad_ref", ref);
                // Populate the referral code input field
                setFormData((prev) => ({ ...prev, referralCode: ref }));
                // Fetch referrer name for display
                fetchReferrerInfo(ref);
            } catch {
                // ignore storage failures (private mode)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load banks when in register mode
    useEffect(() => {
        if (mode !== "register") return;
        const loadBanks = async () => {
            try {
                const json = await api.get("/api/banks");
                setBanks(json?.data || []);
            } catch (e) {
                console.warn("Could not load banks", e);
            }
        };
        loadBanks();
    }, [mode, api]);

    const fetchReferrerInfo = async (referralCode: string) => {
        try {
            const data = await api.get(`/api/user?referralCode=${encodeURIComponent(referralCode)}`);
            if (data?.success && data?.data?.fullName) {
                setReferrerName(data.data.fullName);
            }
        } catch (error) {
            console.error("Failed to fetch referrer info:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // const verifyAccount = async (acctNumber: string, code: string) => {
    //     if (!code || acctNumber.length !== 10) return;
    //     setVerifyingAccount(true);
    //     setAccountVerified(false);
    //     setAccountName("");
    //     try {
    //         const res = await fetch("/api/verify-account", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ accountNumber: acctNumber, bankCode: code }),
    //         });
    //         const json = await res.json();
    //         if (!res.ok || json.error) {
    //             toast.error(json.error || "Could not verify account");
    //             return;
    //         }
    //         setAccountName(json.accountName);
    //         setAccountVerified(true);
    //         toast.success(`Verified: ${json.accountName}`);
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Verification failed. Please try again.");
    //     } finally {
    //         setVerifyingAccount(false);
    //     }
    // };

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
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    const key = issue.path && issue.path.length > 0 ? String(issue.path[0]) : undefined;
                    if (key && !newErrors[key]) newErrors[key] = issue.message;
                });
                setErrors(newErrors);
            } else {
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
                const json = await api.post("/api/auth/login", { email: formData.email, password: formData.password });

                // Save authToken in session store (only token); then fetch user
                try {
                    if (json?.success && json?.data?.token) {
                        dispatch(setToken(json.data.token));
                    }
                } catch (e) {
                    console.error("Failed to save token:", e);
                }

                // Fetch user using session cookie to avoid storing user in response
                let fetchedUser: any = null;
                try {
                    const userJson = await api.get("/api/user");
                    if (userJson?.success && userJson?.data) {
                        fetchedUser = userJson.data;
                        dispatch(setUser(fetchedUser));
                    }
                } catch (e) {
                    console.error("Failed to fetch user after login:", e);
                }

                // Personalized welcome
                const displayName = fetchedUser?.fullName || fetchedUser?.email || "";
                toast.success(displayName ? `Welcome back, ${displayName}` : "Welcome back!", { description: "Redirecting to your dashboard…" });

                // navigate based on role
                const role = fetchedUser?.role ?? "affiliate";
                if (role === "admin" || role === "super_admin") {
                    router.push("/admin");
                } else {
                    router.push("/affiliate");
                }
            } else {
                // registration
                // Use form input first, fallback to sessionStorage if input is empty
                const referralCode = formData.referralCode ||
                    (typeof window !== "undefined" ? sessionStorage.getItem("vijad_ref") || undefined : undefined);

                const json = await api.post("/api/auth/register", {
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    referralCode,
                    bankName,
                    bankCode,
                    accountNumber,
                    // accountName,
                });

                // Successfully registered - redirect to verify email page
                toast.success("Registration successful", {
                    description: "Please check your email to verify your account.",
                });

                // If the backend returned a referral code for the new user, store and show it
                const myReferral = json?.data?.referralCode ?? null;
                if (myReferral) {
                    try {
                        sessionStorage.setItem("vijad_my_ref", myReferral);
                    } catch {
                        // ignore storage errors
                    }
                }

                // Always redirect to verify email page
                router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
            }
        } catch (err: any) {
            console.error(err);

            // Check if error is due to unverified email (403 status)
            if (err?.status === 403 && err?.message === "Email not verified" && err?.data?.email) {
                toast.error("Please verify your email to continue", {
                    description: "Redirecting to verification page...",
                });
                // Redirect to verify-email page with the email from error response
                setTimeout(() => {
                    router.push(`/auth/verify-email?email=${encodeURIComponent(err.data.email)}`);
                }, 1000);
                return;
            }

            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        const newMode = mode === "login" ? "register" : "login";
        setMode(newMode);
        setErrors({});
        setReferrerName(null);
        setRegistrationStep(1);
        setFormData({ fullName: "", email: "", password: "", confirmPassword: "", referralCode: "" });
        setBankCode("");
        setBankName("");
        setAccountNumber("");
        // setAccountName("");
        // setAccountVerified(false);

        const params = new URLSearchParams(searchParams?.toString() ?? "");
        params.set("mode", newMode);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleNextStep = () => {
        // Validate current step before proceeding
        if (registrationStep === 1) {
            // Validate personal info
            try {
                registerSchema.parse(formData);
                setErrors({});
                setRegistrationStep(2);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const newErrors: Record<string, string> = {};
                    error.issues.forEach((issue) => {
                        const key = issue.path && issue.path.length > 0 ? String(issue.path[0]) : undefined;
                        if (key && !newErrors[key]) newErrors[key] = issue.message;
                    });
                    setErrors(newErrors);
                }
            }
        } else if (registrationStep === 2) {
            // Validate bank details (no verification required)
            if (!bankCode || accountNumber.length !== 10) {
                toast.error("Please select a bank and enter a 10-digit account number.");
                return;
            }
            setRegistrationStep(3);
        }
    };

    const handlePrevStep = () => {
        if (registrationStep > 1) {
            setRegistrationStep((prev) => (prev - 1) as RegistrationStep);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNNDAgMzBoNHY0aC00ek00NCAyNmg0djRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Link href="/" className="flex items-center gap-3 mb-12">
                            <Image src={"/vijad-projects.png"} width={150} height={100} alt="vijad" />
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-display font-bold text-white mb-6 leading-tight">
                            Join Our Elite
                            <br />
                            <span className="text-vijad-gold">Affiliate Network</span>
                        </h1>

                        <p className="text-lg text-white/80 mb-8 max-w-md">
                            Partner with Vijad Projects and earn competitive commissions by connecting buyers with premium real estate opportunities.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Earn up to 15% commission on every sale",
                                "Access exclusive property listings",
                                "Real-time tracking and analytics",
                                "Dedicated affiliate support team",
                            ].map((benefit, index) => (
                                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-vijad-gold" />
                                    <span className="text-white/90">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute top-20 -left-10 w-40 h-40 rounded-full bg-vijad-gold/10 blur-2xl" />
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                    <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
                        <Image src={"/vijad-projects-dark.png"} width={130} height={100} alt="vijad" />
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-3xl font-display font-bold text-foreground mb-2">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
                        <p className="text-muted-foreground">{mode === "login" ? "Enter your credentials to access your dashboard" : "Start your journey as a vijad affiliate partner"}</p>
                        {mode === "register" && referrerName && (
                            <div className="mt-4 p-3 rounded-lg bg-vijad-gold/10 border border-vijad-gold/20">
                                <p className="text-sm text-vijad-gold font-medium">
                                    ✨ Referred by <span className="font-bold">{referrerName}</span>
                                </p>
                            </div>
                        )}
                        {/* Registration Progress Indicator */}
                        {mode === "register" && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <div className={`h-2 rounded-full transition-all ${registrationStep >= 1 ? "bg-primary w-16" : "bg-gray-200 w-12"}`} />
                                <div className={`h-2 rounded-full transition-all ${registrationStep >= 2 ? "bg-primary w-16" : "bg-gray-200 w-12"}`} />
                                <div className={`h-2 rounded-full transition-all ${registrationStep >= 3 ? "bg-primary w-16" : "bg-gray-200 w-12"}`} />
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form key={mode} initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }} transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="space-y-5">

                            {/* Step 1: Personal Information (Registration) */}
                            {mode === "register" && registrationStep === 1 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="fullName" name="fullName" type="text" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} className={`pl-10 h-12 ${errors.fullName ? "border-destructive" : ""}`} />
                                        </div>
                                        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                                    </div>

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
                                            <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={formData.password} onChange={handleInputChange} className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    </div>

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

                                    <Button type="button" onClick={handleNextStep} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base">
                                        Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </>
                            )}

                            {/* Step 2: Bank Details (Registration) */}
                            {mode === "register" && registrationStep === 2 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Bank</Label>
                                        <Select
                                            value={bankCode}
                                            onValueChange={(code) => {
                                                const bank = banks.find((b) => b.code === code);
                                                setBankCode(code);
                                                setBankName(bank?.name || "");
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder="Select your bank" />
                                            </SelectTrigger>
                                            <SelectContent className="border-0">
                                                {banks.map((b, idx) => (
                                                    <SelectItem key={idx} value={b.code} className="hover:bg-gray-100 focus:bg-gray-100">{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="accountNumber">Account Number</Label>
                                        <Input
                                            id="accountNumber"
                                            name="accountNumber"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={accountNumber}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, "");
                                                setAccountNumber(v);
                                            }}
                                            placeholder="Enter 10-digit account number"
                                            className="h-12"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="button" onClick={handlePrevStep} variant="outline" className="flex-1 h-12 font-semibold">
                                            Back
                                        </Button>
                                        <Button type="button" onClick={handleNextStep} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold">
                                            Next <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Referral Code (Registration) */}
                            {mode === "register" && registrationStep === 3 && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="referralCode">Referral Code</Label>
                                            <span className="text-xs text-muted-foreground">Optional</span>
                                        </div>
                                        <Input
                                            id="referralCode"
                                            name="referralCode"
                                            type="text"
                                            placeholder="e.g., REF12345678"
                                            value={formData.referralCode}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                if (e.target.value) {
                                                    fetchReferrerInfo(e.target.value);
                                                } else {
                                                    setReferrerName(null);
                                                }
                                            }}
                                            className={`h-12 ${errors.referralCode ? "border-destructive" : ""}`}
                                        />
                                        {referrerName && (
                                            <p className="text-sm text-vijad-gold font-medium">✨ Referred by {referrerName}</p>
                                        )}
                                        {errors.referralCode && <p className="text-sm text-destructive">{errors.referralCode}</p>}
                                        <p className="text-xs text-muted-foreground">
                                            If someone referred you, enter their code here. You can skip this step if you don't have one.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="button" onClick={handlePrevStep} variant="outline" className="flex-1 h-12 font-semibold">
                                            Back
                                        </Button>
                                        <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold">
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><span>Complete</span><ArrowRight className="ml-2 h-5 w-5" /></>)}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {/* Login Form */}
                            {mode === "login" && (
                                <>
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
                                            <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={handleInputChange} className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                    </div>

                                    <div className="flex justify-end">
                                        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base">
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><span>Sign In</span><ArrowRight className="ml-2 h-5 w-5" /></>)}
                                    </Button>
                                </>
                            )}
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
