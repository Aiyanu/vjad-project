"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

/**
 * Initialize auth state - Redux handles persistence automatically
 * This hook is kept for compatibility but no longer required
 */
export function useInitializeAuth() {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    // Optional: Log current auth state for debugging
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("Auth initialized:", {
        user: user?.email,
        hasToken: !!token,
      });
    }
  }, [user, token]);
}
