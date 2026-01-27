import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useApi } from "./useApi";

interface AffiliateDetails {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  referralCode: string | null;
  emailVerified: boolean;
  isDisabled: boolean;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  createdAt: string;
  referrals: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    emailVerified: boolean;
    createdAt: string;
  }>;
  referralsCount: number;
}

export function useAffiliateDetails(affiliateId: string) {
  const [affiliate, setAffiliate] = useState<AffiliateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const fetchAffiliateDetails = useCallback(async () => {
    if (!affiliateId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `/api/admin/affiliates/${affiliateId}/details`
      );
      if (response?.success && response?.data?.affiliate) {
        setAffiliate({
          ...response.data.affiliate,
          referrals: response.data.affiliate.referrals || [],
        });
      } else {
        setError("Failed to load affiliate details");
        toast.error("Failed to load affiliate details");
      }
    } catch (error: any) {
      console.error("Error fetching affiliate details:", error);
      setError(error.message);
      toast.error(error.message || "Failed to load affiliate details");
    } finally {
      setLoading(false);
    }
  }, [affiliateId, api]);

  const updateAffiliateStatus = useCallback(
    async (isDisabled: boolean) => {
      if (!affiliateId) return;

      try {
        const data = await api.put(
          `/api/admin/affiliates/${affiliateId}/status`,
          {
            isDisabled,
          }
        );

        setAffiliate((prev) => (prev ? { ...prev, isDisabled } : null));
        toast.success(
          `Affiliate ${isDisabled ? "disabled" : "enabled"} successfully`
        );
        return data;
      } catch (error: any) {
        console.error("Error updating status:", error);
        toast.error(error.message || "Failed to update status");
        throw error;
      }
    },
    [affiliateId, api]
  );

  useEffect(() => {
    fetchAffiliateDetails();
  }, [fetchAffiliateDetails]);

  return {
    affiliate,
    loading,
    error,
    fetchAffiliateDetails,
    updateAffiliateStatus,
  };
}
