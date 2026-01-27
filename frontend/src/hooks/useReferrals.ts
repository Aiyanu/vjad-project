/**
 * Hook for managing referrals list with server-side pagination, search, and sorting
 * Uses affiliateService for centralized API calls
 */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { affiliateService } from "@/services/affiliateService";
import { useApi } from "./useApi";

interface Referral {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  emailVerified?: boolean;
  referralCode?: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SortField = "fullName" | "email" | "createdAt" | "emailVerified";
type SortOrder = "asc" | "desc";

export function useReferrals() {
  const api = useApi();
  const [referrals, setReferrals] = useState<Referral[]>([]);
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchReferrals = useCallback(
    async (page = 1, isPageChange = false) => {
      try {
        if (isPageChange) {
          setPageLoading(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await affiliateService.fetchReferrals(api, {
          page,
          limit: pagination.limit,
          search: debouncedSearch,
          sortField,
          sortOrder,
        });

        if (response?.success && response?.data) {
          setReferrals(response.data.referrals || []);
          setPagination(response.data.pagination || pagination);
        } else {
          setReferrals([]);
          toast.error("Failed to load referrals");
        }
      } catch (error: any) {
        console.error("Error fetching referrals:", error);
        setError(error.message);
        setReferrals([]);
        toast.error("Failed to load referrals");
      } finally {
        // Always reset both flags to avoid stuck loading states
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

  // Fetch on initial load and when pagination or search/sort changes
  useEffect(() => {
    fetchReferrals(pagination.page, pagination.page !== 1);
  }, [
    debouncedSearch,
    sortField,
    sortOrder,
    pagination.limit,
    pagination.page,
    fetchReferrals,
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

  return {
    referrals,
    loading,
    pageLoading,
    error,
    pagination,
    searchQuery,
    setSearchQuery,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    fetchReferrals,
  };
}
