import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Affiliate {
  id: string;
  email: string;
  fullName: string | null;
  referralCode: string;
  emailVerified: boolean;
  isDisabled: boolean;
  createdAt: string;
  phone: string | null;
  bankName: string | null;
  accountNumber: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState(10);

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
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(pageSize),
          ...(debouncedSearch && { search: debouncedSearch }),
          sortField,
          sortOrder,
        });

        const res = await fetch(`/api/admin/affiliates?${params}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch affiliates");
        }

        const data = await res.json();
        setAffiliates(data.affiliates || []);
        setPagination(data.pagination || {});
      } catch (error) {
        console.error("Error fetching affiliates:", error);
        toast.error("Failed to load affiliates");
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliatesData();
  }, [currentPage, debouncedSearch, sortField, sortOrder, pageSize]);

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

  return {
    affiliates,
    pagination,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    sortField,
    sortOrder,
    handleSort,
    pageSize,
    setPageSize,
    removeAffiliate,
    updateAffiliateStatus,
  };
};
