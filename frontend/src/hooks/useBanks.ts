import { useState, useCallback } from "react";
import useApi from "./useApi";

interface Bank {
  name: string;
  code: string;
  slug: string;
}

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/banks");
      if (response?.banks) {
        setBanks(response.banks);
        return response.banks;
      } else {
        setBanks([]);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching banks:", error);
      setError(error.message);
      setBanks([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    banks,
    loading,
    error,
    fetchBanks,
  };
}
