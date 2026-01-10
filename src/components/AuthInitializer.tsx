"use client";

import { ReactNode, useEffect } from "react";

export function AuthInitializer({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Zustand persist middleware handles rehydration automatically
        // This ensures the store is hydrated from sessionStorage on mount
    }, []);

    return <>{children}</>;
}
