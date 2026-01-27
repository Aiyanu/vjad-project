"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type User = {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  referralCode?: string;
  role?: string | null;
  isDisabled?: boolean;
  createdAt?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  clearAuth: () => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (u) => set({ user: u }),
      setToken: (t) => set({ token: t }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "vijad_auth_session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
