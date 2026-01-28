// src/services/userService.ts
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null;
  const headers: Record<string, string> = { ...(options.headers as any) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.message || data?.error || "Request failed");
  return data;
}

export const userService = {
  getBanks: async () => fetchWithAuth("/banks"),
  updateProfile: async (payload: any) =>
    fetchWithAuth("/user/update-profile", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  changePassword: async (newPassword: string) =>
    fetchWithAuth("/user/change-password", {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }),
};
