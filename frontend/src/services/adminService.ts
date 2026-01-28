const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const ADMIN_URLS = {
  ADMINS_LIST: "/admin/admins",
  ADMINS_CREATE: "/admin/admins",
  ADMIN_ITEM: (id: string) => `/admin/admins/${id}`,
  AFFILIATES_LIST: "/admin/affiliates",
  AFFILIATES_DETAILS: (id: string) => `/admin/affiliates/${id}/details`,
  USER_STATUS: (id: string) => `/admin/users/${id}/status`,
  USER_DELETE: (id: string) => `/admin/users/${id}`,
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

export const adminService = {
  fetchAdmins: async (params: {
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
    return fetchWithAuth(`${ADMIN_URLS.ADMINS_LIST}?${queryParams}`);
  },
  createAdmin: async (data: {
    fullName: string;
    email: string;
    role?: "admin" | "super_admin";
  }) => {
    return fetchWithAuth(ADMIN_URLS.ADMINS_CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateAdminRole: async (id: string, role: "admin" | "super_admin") => {
    return fetchWithAuth(ADMIN_URLS.ADMIN_ITEM(id), {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  },
  getAffiliateDetails: async (id: string) => {
    return fetchWithAuth(ADMIN_URLS.AFFILIATES_DETAILS(id));
  },
  updateAffiliateStatus: async (id: string, isDisabled: boolean) => {
    return fetchWithAuth(`/admin/affiliates/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ isDisabled }),
    });
  },
  deleteUser: async (id: string) => {
    return fetchWithAuth(ADMIN_URLS.USER_DELETE(id), { method: "DELETE" });
  },
  getCurrentUser: async () => {
    return fetchWithAuth("/user");
  },
  getUserByReferralCode: async (referralCode: string) => {
    return fetchWithAuth(
      `/user?referralCode=${encodeURIComponent(referralCode)}`,
    );
  },
};
