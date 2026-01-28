/**
 * Auth service: centralized authentication API calls
 * Handles login, registration, password reset, email verification, etc.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const AUTH_URLS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY: "/auth/verify",
  RESEND_VERIFICATION: "/auth/resend-verification",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
};

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null;
  const headers: Record<string, string> = { ...(options.headers as any) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.message || data?.error || "Request failed");
  return data;
}

export const authService = {
  login: async (email: string, password: string) => {
    return fetchWithAuth(AUTH_URLS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    referralCode?: string;
  }) => {
    return fetchWithAuth(AUTH_URLS.REGISTER, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  verifyEmail: async (token: string, email: string) => {
    return fetchWithAuth(
      `${AUTH_URLS.VERIFY}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
    );
  },
  resendVerification: async (email: string) => {
    return fetchWithAuth(AUTH_URLS.RESEND_VERIFICATION, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  forgotPassword: async (email: string) => {
    return fetchWithAuth(AUTH_URLS.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string) => {
    return fetchWithAuth(AUTH_URLS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },

  getCurrentUser: async () => {
    return fetchWithAuth("/user");
  },
  getUserByReferralCode: async (referralCode: string) => {
    return fetchWithAuth(
      `/user?referralCode=${encodeURIComponent(referralCode)}`,
    );
  },
  getBanks: async () => {
    return fetchWithAuth("/banks");
  },
};
