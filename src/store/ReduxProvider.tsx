"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { setUser } from "./userSlice";
import { setToken } from "./globalSlice";

export default function ReduxProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore | undefined>(undefined);

    if (!storeRef.current) {
        storeRef.current = makeStore();

        // Hydrate from sessionStorage on initialization
        if (typeof window !== "undefined") {
            // Try sessionStorage first for user data
            const storedUser = sessionStorage.getItem("vjad_user_session");
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.user) {
                        storeRef.current.dispatch(setUser(parsed.user));
                    }
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                }
            }

            // Check for JWT token in sessionStorage
            const storedToken = sessionStorage.getItem("authToken");
            if (storedToken) {
                storeRef.current.dispatch(setToken(storedToken));
            }
        }
    }

    // Subscribe to store changes and persist to storage
    useEffect(() => {
        if (!storeRef.current) return;

        const unsubscribe = storeRef.current.subscribe(() => {
            const state = storeRef.current!.getState();

            // Persist user to sessionStorage
            sessionStorage.setItem(
                "vjad_user_session",
                JSON.stringify({
                    user: state.user.user,
                })
            );
        });

        return unsubscribe;
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}
