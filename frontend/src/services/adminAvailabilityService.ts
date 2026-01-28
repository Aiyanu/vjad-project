// Centralized admin availability service for all admin/availability API calls

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const ADMIN_AVAILABILITY_URLS = {
  AVAILABILITY: "/admin/availability",
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

export const adminAvailabilityService = {
  fetchAvailability: async () =>
    fetchWithAuth(ADMIN_AVAILABILITY_URLS.AVAILABILITY),
  fetchAvailabilityByDate: async (date: string) =>
    fetchWithAuth(`${ADMIN_AVAILABILITY_URLS.AVAILABILITY}?date=${date}`),
  setAvailability: async (data: any) =>
    fetchWithAuth(ADMIN_AVAILABILITY_URLS.AVAILABILITY, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
