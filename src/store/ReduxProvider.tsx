"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { hydrateAuth } from "./authSlice";

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
            const stored = sessionStorage.getItem("vjad_auth_session");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.state) {
                        storeRef.current.dispatch(hydrateAuth(parsed.state));
                    }
                } catch (e) {
                    console.error("Failed to parse stored auth", e);
                }
            }
        }
    }

    // Subscribe to store changes and persist to sessionStorage
    useEffect(() => {
        if (!storeRef.current) return;

        const unsubscribe = storeRef.current.subscribe(() => {
            const state = storeRef.current!.getState();
            sessionStorage.setItem(
                "vjad_auth_session",
                JSON.stringify({
                    state: {
                        user: state.auth.user,
                        token: state.auth.token,
                    },
                })
            );
        });

        return unsubscribe;
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}
