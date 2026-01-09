"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function AdminSignup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/admin-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create admin account");
            }

            toast.success("Admin account created successfully!");
            setTimeout(() => {
                router.push("/auth");
            }, 1500);
        } catch (error: any) {
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-vjad-navy)] via-[var(--color-vjad-primary)] to-[var(--color-vjad-navy)] p-4">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-[var(--color-vjad-navy)] flex items-center justify-center">
                            <Shield className="h-8 w-8 text-[var(--color-vjad-gold)]" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-[var(--color-vjad-navy)]">
                        Admin Registration
                    </CardTitle>
                    <CardDescription>
                        Create a super admin account to manage the platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
                                    }
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@vijadproject.com"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <PhoneInput
                                country={"ng"}
                                value={formData.phone}
                                onChange={(phone) => setFormData({ ...formData, phone })}
                                disabled={loading}
                                inputStyle={{
                                    width: "100%",
                                    height: "40px",
                                    fontSize: "14px",
                                    paddingLeft: "48px",
                                    borderRadius: "6px",
                                    border: "1px solid hsl(var(--border))",
                                }}
                                buttonStyle={{
                                    borderRadius: "6px 0 0 6px",
                                    border: "1px solid hsl(var(--border))",
                                }}
                                containerClass="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) =>
                                        setFormData({ ...formData, confirmPassword: e.target.value })
                                    }
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[var(--color-vjad-navy)] hover:bg-[var(--color-vjad-primary)] text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Create Admin Account
                                </>
                            )}
                        </Button>

                        <div className="text-center text-sm text-[var(--color-muted-foreground)]">
                            Already have an account?{" "}
                            <Button
                                variant="link"
                                className="p-0 h-auto text-[var(--color-vjad-primary)]"
                                onClick={() => router.push("/auth")}
                                type="button"
                            >
                                Sign in
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
