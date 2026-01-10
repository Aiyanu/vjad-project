import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useApi } from "./useApi";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  referralCode?: string;
  phone?: string;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface ResendVerificationData {
  email: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const login = useCallback(
    async (data: LoginData) => {
      setLoading(true);
      try {
        const result = await api.post("/api/auth/login", data);
        return result;
      } catch (error: any) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      try {
        const result = await api.post("/api/auth/register", data);
        return result;
      } catch (error: any) {
        console.error("Registration error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const forgotPassword = useCallback(
    async (data: ForgotPasswordData) => {
      setLoading(true);
      try {
        const result = await api.post("/api/auth/forgot-password", data);
        return result;
      } catch (error: any) {
        console.error("Forgot password error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordData) => {
      setLoading(true);
      try {
        const result = await api.post("/api/auth/reset", data);
        return result;
      } catch (error: any) {
        console.error("Reset password error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const verifyEmail = useCallback(
    async (token: string) => {
      setLoading(true);
      try {
        const result = await api.get(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );
        return result;
      } catch (error: any) {
        console.error("Verify email error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const resendVerification = useCallback(
    async (data: ResendVerificationData) => {
      setLoading(true);
      try {
        const result = await api.post("/api/auth/resend-verification", data);
        return result;
      } catch (error: any) {
        console.error("Resend verification error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const fetchUser = useCallback(
    async (referralCode?: string) => {
      setLoading(true);
      try {
        const url = referralCode
          ? `/api/user?referralCode=${encodeURIComponent(referralCode)}`
          : "/api/user";

        const result = await api.get(url);
        return result;
      } catch (error: any) {
        console.error("Fetch user error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    fetchUser,
  };
}
