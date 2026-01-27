/**
 * Affiliate service: centralized affiliate-related API calls
 */
import { ApiService } from "./api";

// URL constants for affiliate endpoints
const AFFILIATE_URLS = {
  REFERRALS_LIST: "/api/affiliate/referrals",
  REFERRALS_COUNT: "/api/affiliate/referrals/count",
};

export const affiliateService = {
  /**
   * Fetch referrals with pagination, search, and sorting
   */
  fetchReferrals: async (
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
    return api.get(`${AFFILIATE_URLS.REFERRALS_LIST}?${queryParams}`);
  },

  /**
   * Fetch referral count
   */
  fetchReferralCount: async (api: ApiService) => {
    return api.get(AFFILIATE_URLS.REFERRALS_COUNT);
  },
};
