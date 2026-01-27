/**
 * Hook for managing admin list with server-side pagination, search, and sorting
 * Uses adminService for centralized API calls
 */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import { useApi } from "./useApi";

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SortField = "fullName" | "email" | "role" | "createdAt";
type SortOrder = "asc" | "desc";

export function useAdmins() {
  const api = useApi();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAdmins = useCallback(
    async (page = 1, isPageChange = false) => {
      try {
        if (isPageChange) setPageLoading(true);
        else setLoading(true);
        setError(null);

        const response = await adminService.fetchAdmins(api, {
          page,
          limit: pagination.limit,
          search: debouncedSearch,
          sortField,
          sortOrder,
        });

        if (response?.success && response?.data) {
          setAdmins(response.data.admins || []);
          setPagination(response.data.pagination || pagination);
        } else {
          setAdmins([]);
          toast.error("Failed to load admins");
        }
      } catch (err: any) {
        console.error("Error fetching admins:", err);
        setError(err.message);
        setAdmins([]);
        toast.error("Failed to load admins");
      } finally {
        setPageLoading(false);
        setLoading(false);
      }
    },
    [api, debouncedSearch, sortField, sortOrder, pagination.limit]
  );

  // Reset to page 1 when search/sort changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, sortField, sortOrder]);

  // Fetch when pagination or fetch dependencies change
  useEffect(() => {
    fetchAdmins(pagination.page, pagination.page !== 1);
  }, [
    debouncedSearch,
    sortField,
    sortOrder,
    pagination.limit,
    pagination.page,
    fetchAdmins,
  ]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit: newSize }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const addAdmin = useCallback(
    async (data: {
      fullName: string;
      email: string;
      role?: "admin" | "super_admin";
    }) => {
      try {
        const result = await adminService.createAdmin(api, data);
        toast.success(
          "Admin added successfully! Credentials sent to their email."
        );
        await fetchAdmins(pagination.page, true);
        return result;
      } catch (error: any) {
        console.error("Error adding admin:", error);
        toast.error(error.message || "Failed to add admin");
        throw error;
      }
    },
    [api, fetchAdmins, pagination.page]
  );

  const deleteAdmin = useCallback(
    async (id: string) => {
      try {
        await adminService.deleteAdmin(api, id);
        toast.success("Admin removed successfully");
        await fetchAdmins(pagination.page, true);
      } catch (error: any) {
        console.error("Error deleting admin:", error);
        toast.error(error.message || "Failed to remove admin");
        throw error;
      }
    },
    [api, fetchAdmins, pagination.page]
  );

  const updateAdminRole = useCallback(
    async (id: string, role: "admin" | "super_admin") => {
      try {
        await adminService.updateAdminRole(api, id, role);
        toast.success("Admin role updated");
        await fetchAdmins(pagination.page, true);
      } catch (error: any) {
        console.error("Error updating admin role:", error);
        toast.error(error.message || "Failed to update role");
        throw error;
      }
    },
    [api, fetchAdmins, pagination.page]
  );

  return {
    admins,
    loading,
    pageLoading,
    error,
    pagination,
    searchQuery,
    setSearchQuery,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    fetchAdmins,
    addAdmin,
    deleteAdmin,
    updateAdminRole,
  };
}
