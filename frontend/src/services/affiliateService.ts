/**
 * Affiliate service: centralized affiliate-related API calls
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const AFFILIATE_URLS = {
  REFERRALS_LIST: "/affiliate/referrals",
  REFERRALS_COUNT: "/affiliate/referrals/count",
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

export const affiliateService = {
  fetchReferrals: async (params: {
    page: number;
    limit: number;
    search?: string;
    sortField?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      ...(params.search && { search: params.search }),
      ...(params.sortField && { sortField: params.sortField }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });
    return fetchWithAuth(`${AFFILIATE_URLS.REFERRALS_LIST}?${queryParams}`);
  },
  fetchReferralCount: async () => {
    return fetchWithAuth(AFFILIATE_URLS.REFERRALS_COUNT);
  },
  verifyAccount: async (accountNumber: string, bankCode: string) => {
    return fetchWithAuth("/verify-account", {
      method: "POST",
      body: JSON.stringify({ accountNumber, bankCode }),
    });
  },
  fetchAffiliates: async () => {
    return fetchWithAuth("/admin/affiliates");
  },
  getCurrentUser: async () => {
    return fetchWithAuth("/user");
  },
};
