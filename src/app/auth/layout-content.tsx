"use client";

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useToken } from '@/hooks/useToken';

function AuthLayoutContentInner({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const user = useAppSelector((state) => state.user.user);
    const { token } = useToken();

    useEffect(() => {
        // Check if user is already authenticated
        if (user && token) {
            // Navigate based on role
            if (user.role === 'admin' || user.role === 'super_admin') {
                router.push('/admin');
            } else {
                router.push('/affiliate');
            }
        }
    }, [user, token, router]);

    // Don't render auth forms if user is already logged in
    if (user && token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        );
    }

    return <>{children}</>;
}

export default function AuthLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <AuthLayoutContentInner>{children}</AuthLayoutContentInner>
        </Suspense>
    );
}
