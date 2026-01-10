import { useState, useEffect, useCallback } from "react";
import useApi from "./useApi";

export function useReferralCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/affiliate/referrals/count");

      if (response?.success && response?.data) {
        console.log(response.data.count);
        setCount(response.data.count);
      } else {
        setCount(0);
      }
    } catch (error: any) {
      console.error("Error fetching referral count:", error);
      setError(error.message);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {}, [count]);

  return {
    count,
    loading,
    error,
    fetchCount,
  };
}
