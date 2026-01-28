import { useState, useCallback } from "react";
import { userService } from "@/services/userService";

interface Bank {
  name: string;
  code: string;
  slug: string;
}

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getBanks();
      if (response?.success && response?.data) {
        setBanks(response.data);
        return response.data;
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
  }, []);

  return {
    banks,
    loading,
    error,
    fetchBanks,
  };
}
