// src/services/bankService.ts
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

export const bankService = {
  getBanks: async () => {
    return fetchWithAuth("/banks");
  },
  verifyAccount: async (accountNumber: string, bankCode: string) => {
    return fetchWithAuth("/verify-account", {
      method: "POST",
      body: JSON.stringify({ accountNumber, bankCode }),
    });
  },
};
