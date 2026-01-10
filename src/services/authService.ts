/**
 * Auth service: centralized authentication API calls
 * Handles login, registration, password reset, email verification, etc.
 */
import { ApiService } from "./api";

// URL constants for auth endpoints
const AUTH_URLS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  VERIFY_EMAIL: "/api/auth/verify-email",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  ADMIN_SIGNUP: "/api/auth/admin-signup",
};

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (api: ApiService, email: string, password: string) => {
    return api.post(AUTH_URLS.LOGIN, { email, password });
  },

  /**
   * Register new user (affiliate)
   */
  register: async (
    api: ApiService,
    data: {
      fullName: string;
      email: string;
      password: string;
      referralCode?: string;
    }
  ) => {
    return api.post(AUTH_URLS.REGISTER, data);
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (api: ApiService, token: string) => {
    return api.post(AUTH_URLS.VERIFY_EMAIL, { token });
  },

  /**
   * Request password reset
   */
  forgotPassword: async (api: ApiService, email: string) => {
    return api.post(AUTH_URLS.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    api: ApiService,
    token: string,
    newPassword: string
  ) => {
    return api.post(AUTH_URLS.RESET_PASSWORD, { token, newPassword });
  },

  /**
   * Admin signup (create super admin)
   */
  adminSignup: async (
    api: ApiService,
    data: {
      fullName: string;
      email: string;
      phone?: string;
      password: string;
    }
  ) => {
    return api.post(AUTH_URLS.ADMIN_SIGNUP, data);
  },
};
