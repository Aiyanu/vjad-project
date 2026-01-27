"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/userSlice";
import { clearToken } from "@/store/globalSlice";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "admin" | "super_admin" | "affiliate";
    allowedRoles?: Array<"admin" | "super_admin" | "affiliate">;
}

export function ProtectedRoute({
    children,
    requiredRole,
    allowedRoles,
}: ProtectedRouteProps) {
    const router = useRouter();
    const user = useAppSelector((state) => state.user.user);
    const token = useAppSelector((state) => state.global.token);
    const dispatch = useAppDispatch();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for store rehydration
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isChecking) return;

        // Check if user is logged in
        if (!user || !token) {
            router.replace("/auth");
            return;
        }

        // Check if user is disabled
        if (user.isDisabled) {
            // Clear auth and show alert
            dispatch(clearUser());
            dispatch(clearToken());
            alert("Your account has been disabled. Please contact support for assistance.");
            router.replace("/auth");
            return;
        }

        // Check role-based access
        if (requiredRole && user.role !== requiredRole) {
            // Redirect to appropriate dashboard based on role
            if (user.role === "affiliate") {
                router.replace("/affiliate");
            } else if (user.role === "admin" || user.role === "super_admin") {
                router.replace("/admin");
            } else {
                router.replace("/");
            }
            return;
        }

        // Check if user has one of the allowed roles
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.role as any)) {
                // Redirect to appropriate dashboard based on role
                if (user.role === "affiliate") {
                    router.replace("/affiliate");
                } else if (user.role === "admin" || user.role === "super_admin") {
                    router.replace("/admin");
                } else {
                    router.replace("/");
                }
                return;
            }
        }
    }, [user, token, requiredRole, allowedRoles, router, isChecking, dispatch]);

    // Show loading state while checking auth
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-vijad-navy)"></div>
                    <p className="mt-4 text-(--color-vijad-navy)">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children until auth check is complete
    if (!user || !token) {
        return null;
    }

    // Check role access
    if (requiredRole && user.role !== requiredRole) {
        return null;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role as any)) {
            return null;
        }
    }

    return <>{children}</>;
}
