/**
 * Admin service: centralized admin-related API calls
 * Includes admins list/create and affiliates management
 */
import { ApiService } from "./api";

// URL constants for admin endpoints
const ADMIN_URLS = {
  ADMINS_LIST: "/api/admin/admins",

  /**
   * Update admin role (super_admin only)
   */
  updateAdminRole: async (
    api: ApiService,
    id: string,
    role: "admin" | "super_admin"
  ) => {
    return api.patch(ADMIN_URLS.ADMIN_ITEM(id), { role });
  },
  ADMINS_CREATE: "/api/admin/admins",
  ADMIN_ITEM: (id: string) => `/api/admin/admins/${id}`,
  AFFILIATES_LIST: "/api/admin/affiliates",
  AFFILIATES_DETAILS: (id: string) => `/api/admin/affiliates/${id}/details`,
};

export const adminService = {
  /**
   * Fetch admins with pagination, search, and sorting
   */
  fetchAdmins: async (
    api: ApiService,
    params: {
      page: number;
      limit: number;
      search?: string;
      sortField?: string;
      sortOrder?: string;
    }
  ) => {
    const queryParams = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      ...(params.search && { search: params.search }),
      ...(params.sortField && { sortField: params.sortField }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });
    return api.get(`${ADMIN_URLS.ADMINS_LIST}?${queryParams}`);
  },

  /**
   * Create a new admin
   */
  createAdmin: async (
    api: ApiService,
    data: { fullName: string; email: string; role?: "admin" | "super_admin" }
  ) => {
    return api.post(ADMIN_URLS.ADMINS_CREATE, data);
  },

  /**
   * Delete an admin (super_admin only)
   */
  deleteAdmin: async (api: ApiService, id: string) => {
    return api.delete(ADMIN_URLS.ADMIN_ITEM(id));
  },

  /**
   * Fetch affiliates list with pagination, search, and sorting
   */
  fetchAffiliates: async (
    api: ApiService,
    params: {
      page: number;
      limit: number;
      search?: string;
      sortField?: string;
      sortOrder?: string;
    }
  ) => {
    const queryParams = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      ...(params.search && { search: params.search }),
      ...(params.sortField && { sortField: params.sortField }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });
    return api.get(`${ADMIN_URLS.AFFILIATES_LIST}?${queryParams}`);
  },

  /**
   * Fetch affiliate details by ID
   */
  fetchAffiliateDetails: async (api: ApiService, id: string) => {
    return api.get(ADMIN_URLS.AFFILIATES_DETAILS(id));
  },
};
