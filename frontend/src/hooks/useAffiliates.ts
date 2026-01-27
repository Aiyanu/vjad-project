import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import useApi from "./useApi";

export interface Affiliate {
  id: string;
  email: string;
  fullName: string | null;
  referralCode: string | null;
  emailVerified: boolean;
  isDisabled: boolean;
  createdAt: string;
  phone: string | null;
  bankName: string | null;
  bankCode?: string | null;
  accountNumber: string | null;
  accountName?: string | null;
  referralsCount: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type SortField =
  | "fullName"
  | "email"
  | "phone"
  | "referralsCount"
  | "createdAt"
  | "isDisabled";
export type SortOrder = "asc" | "desc";

export const useAffiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState(10);
  const api = useApi();

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch affiliates whenever pagination, search, or sort changes
  useEffect(() => {
    const fetchAffiliatesData = async () => {
      const isInitialLoad = affiliates.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(pageSize),
          ...(debouncedSearch && { search: debouncedSearch }),
          sortField,
          sortOrder,
        });

        const response = await api.get(`/api/admin/affiliates?${params}`);

        if (response?.success && response?.data) {
          setAffiliates(response.data.affiliates || []);
          setPagination(response.data.pagination || {});
        } else {
          setAffiliates([]);
          toast.error("Failed to load affiliates");
        }
      } catch (error) {
        console.error("Error fetching affiliates:", error);
        // Only show error if it's not just an empty result
        setAffiliates([]);
        toast.error("Failed to load affiliates");
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };

    fetchAffiliatesData();
  }, [currentPage, debouncedSearch, sortField, sortOrder, pageSize, api]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const removeAffiliate = (affiliateId: string) => {
    setAffiliates((prev) => prev.filter((a) => a.id !== affiliateId));
  };

  const updateAffiliateStatus = (affiliateId: string, isDisabled: boolean) => {
    setAffiliates((prev) =>
      prev.map((a) => (a.id === affiliateId ? { ...a, isDisabled } : a))
    );
  };

  const deleteAffiliate = useCallback(
    async (affiliateId: string) => {
      try {
        const data = await api.del(`/api/admin/affiliates/${affiliateId}`);

        removeAffiliate(affiliateId);
        toast.success("Affiliate deleted successfully");
        return data;
      } catch (error: any) {
        console.error("Error deleting affiliate:", error);
        toast.error(error.message || "Failed to delete affiliate");
        throw error;
      }
    },
    [api]
  );

  const toggleAffiliateStatus = useCallback(
    async (affiliateId: string, isDisabled: boolean) => {
      try {
        const data = await api.put(`/api/admin/affiliates/${affiliateId}`, {
          isDisabled,
        });

        updateAffiliateStatus(affiliateId, isDisabled);
        toast.success(
          `Affiliate ${isDisabled ? "disabled" : "enabled"} successfully`
        );
        return data;
      } catch (error: any) {
        console.error("Error updating affiliate status:", error);
        toast.error(error.message || "Failed to update affiliate status");
        throw error;
      }
    },
    [api]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    affiliates,
    pagination,
    loading,
    pageLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    sortField,
    sortOrder,
    handleSort,
    pageSize,
    setPageSize,
    handlePageChange,
    handlePageSizeChange,
    removeAffiliate,
    updateAffiliateStatus,
    deleteAffiliate,
    toggleAffiliateStatus,
  };
};
