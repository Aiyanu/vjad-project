"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/userSlice";
import { useToken } from "@/hooks/useToken";
import { authService } from "@/services/authService";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

/**
 * NOTE:
 * - This component relies on the shadcn/ui form primitives being exported from "@/components/ui/form".
 * - Ensure `@hookform/resolvers` and `zod` are installed.
 */

/* ----- Zod schemas ----- */
const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
    .object({
        fullName: z.string().min(2, "Please enter your full name"),
        email: z.string().min(1, "Email is required").email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;


type Mode = "login" | "register";

export interface AuthFormProps {
    mode?: Mode;
    redirectTo?: string;
}

type FormValues =
    | {
            email: string;
            password: string;
        }
    | {
            fullName: string;
            email: string;
            password: string;
            confirmPassword: string;
        };

/* ----- Reusable component ----- */
export function AuthForm({
    mode = "login",
    redirectTo = "/affiliate/dashboard",
}: AuthFormProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { saveToken } = useToken();
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    const isLogin = mode === "login";

    const form = useForm<FormValues>({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
        defaultValues: isLogin
            ? { email: "", password: "" }
            : { fullName: "", email: "", password: "", confirmPassword: "" },
        mode: "onBlur",
    });

    const onSubmit = async (values: LoginValues | RegisterValues) => {
        setServerError(null);
        setLoading(true);

        try {
            const isLoginMode = mode === "login";
            let data;
            if (isLoginMode) {
                data = await authService.login(
                    (values as LoginValues).email,
                    (values as LoginValues).password
                );
            } else {
                data = await authService.register({
                    email: (values as RegisterValues).email,
                    password: (values as RegisterValues).password,
                    fullName: (values as RegisterValues).fullName,
                });
            }

            // For login, save token and user data to Redux store
            if (isLoginMode && data.token && data.user) {
                saveToken(data.token);
                dispatch(setUser(data.user));
                await new Promise(resolve => setTimeout(resolve, 100));
                router.push(redirectTo);
            } else if (!isLoginMode) {
                const email = (values as RegisterValues).email;
                router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
            }
        } catch (err: any) {
            if (err.status === 403 && err.message === "Email not verified") {
                const email = mode === "login"
                    ? (values as LoginValues).email
                    : (values as RegisterValues).email;
                router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                return;
            }
            setServerError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
                <CardTitle className="text-center text-2xl">
                    {isLogin ? "Welcome Back!" : "Join Vijad Projects"}
                </CardTitle>
                <CardDescription className="text-center">
                    {isLogin ? "Please sign in using your login credentials" : "Create your affiliate account"}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {serverError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
                        )}

                        {!isLogin && (
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="John Doe" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder="you@email.com" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="••••••••" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isLogin && (
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm password</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="password" placeholder="••••••••" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold"
                            disabled={loading}
                        >
                            {loading ? (isLogin ? "Logging in..." : "Creating account...") : isLogin ? "Login" : "Register"}
                        </Button>

                        {/* Success / Info hint (non disruptive) */}
                        <div onClick={() => router.push(isLogin ? "register" : "login")} className="text-sm text-muted-foreground text-center cursor-pointer select-none">
                            {isLogin ? (
                                <>
                                    Don't have an account? <a className="text-primary font-semibold">Register here</a>
                                </>
                            ) : (
                                <>
                                    Already have an account? <a className="text-primary font-semibold">Login here</a>
                                </>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default AuthForm;
