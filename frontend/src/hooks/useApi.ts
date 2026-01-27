import { useAppSelector } from "@/store/hooks";
import { useCallback } from "react";

type Options = RequestInit & { json?: any };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function useApi() {
  const token = useAppSelector((state) => state.global.token);

  const request = useCallback(
    async (path: string, opts: Options = {}) => {
      const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
      const headers: Record<string, string> = {
        ...((opts.headers as Record<string, string>) || {}),
      };

      // Add Authorization header if token exists
      // Prioritize Redux token (which gets hydrated), fallback to sessionStorage
      const authToken =
        token ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem("authToken")
          : null);
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      if (opts.json) {
        headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(opts.json);
      }

      const res = await fetch(url, {
        ...opts,
        headers,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const error: any = new Error(
          data?.message || data?.error || "Request failed"
        );
        error.status = data?.status || res.status;
        error.message = data?.message || data?.error || "Request failed";
        error.data = data?.data; // Include data object if present (e.g., { email, isVerified })
        throw error;
      }
      return data;
    },
    [token]
  );

  return {
    get: (path: string) => request(path, { method: "GET" }),
    post: (path: string, json?: any) => request(path, { method: "POST", json }),
    put: (path: string, json?: any) => request(path, { method: "PUT", json }),
    patch: (path: string, json?: any) => request(path, { method: "PATCH", json }),
    del: (path: string) => request(path, { method: "DELETE" }),
  };
}

export { useApi };
export default useApi;
