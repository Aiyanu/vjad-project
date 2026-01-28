import { useState, useCallback } from "react";
import { toast } from "sonner";
import { authService } from "@/services/authService";

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
  // Removed useApi, now using authService

  const login = useCallback(async (data: LoginData) => {
    setLoading(true);
    try {
      const result = await authService.login(data.email, data.password);
      return result;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await authService.register(data);
      return result;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    setLoading(true);
    try {
      const result = await authService.forgotPassword(data.email);
      return result;
    } catch (error: any) {
      console.error("Forgot password error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    setLoading(true);
    try {
      const result = await authService.resetPassword(data.token, data.password);
      return result;
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token: string, email: string) => {
    setLoading(true);
    try {
      const result = await authService.verifyEmail(token, email);
      return result;
    } catch (error: any) {
      console.error("Verify email error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(
    async (data: ResendVerificationData) => {
      setLoading(true);
      try {
        const result = await authService.resendVerification(data.email);
        return result;
      } catch (error: any) {
        console.error("Resend verification error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchUser = useCallback(async (referralCode?: string) => {
    setLoading(true);
    try {
      let result;
      if (referralCode) {
        result = await authService.getUserByReferralCode(referralCode);
      } else {
        result = await authService.getCurrentUser();
      }
      return result;
    } catch (error: any) {
      console.error("Fetch user error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
