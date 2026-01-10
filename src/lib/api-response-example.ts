/**
 * Example API Response Format & Usage
 *
 * This file demonstrates how to use the standardized API response format
 * throughout your application.
 */

import {
  ApiResponse,
  successResponse,
  errorResponse,
  isSuccessResponse,
} from "@/lib/api-response";

// ===== BACKEND EXAMPLES =====

// Example 1: Successful login response
const loginSuccess: ApiResponse = {
  success: true,
  data: {
    authToken: "eyJhbGc...",
    user: {
      id: "123",
      email: "user@example.com",
      role: "affiliate",
    },
  },
  message: "Login successful",
};

// Example 2: Using helper function
const loginSuccessHelper = successResponse(
  {
    authToken: "eyJhbGc...",
    user: { id: "123", email: "user@example.com" },
  },
  "Login successful"
);

// Example 3: Error response
const loginError: ApiResponse = {
  success: false,
  error: "Invalid email or password",
  message: "Authentication failed",
};

// Example 4: Using error helper
const loginErrorHelper = errorResponse(
  "Invalid email or password",
  "Authentication failed"
);

// Example 5: No data response
const noDataResponse: ApiResponse = {
  success: true,
  message: "Logout successful",
};

// ===== FRONTEND EXAMPLES =====

// Example usage in a component
async function handleLogin(email: string, password: string) {
  try {
    const response = await api.post("/api/auth/login", { email, password });

    // Type-safe check
    if (isSuccessResponse(response)) {
      // response.data is guaranteed to exist here
      const { authToken, user } = response.data;
      dispatch(setToken(authToken));
      dispatch(setUser(user));
      toast.success(response.message || "Login successful");
    } else {
      toast.error(response.error || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("An unexpected error occurred");
  }
}

// Example usage in list fetch
async function fetchAffiliates() {
  try {
    const response = await api.get("/api/admin/affiliates");

    if (response.success) {
      setAffiliates(response.data?.affiliates || []);
    } else {
      toast.error(response.error || "Failed to load affiliates");
    }
  } catch (error) {
    toast.error("An unexpected error occurred");
  }
}

// Example in useEffect hook
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/user");

      if (isSuccessResponse(response)) {
        dispatch(setUser(response.data));
      } else {
        dispatch(clearUser());
        router.push("/auth");
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  if (token) {
    fetchUserData();
  }
}, [token, api]);
