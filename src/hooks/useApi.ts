import { useAppSelector } from "@/store/hooks";

type Options = RequestInit & { json?: any };

function useApi() {
  const token = useAppSelector((state) => state.auth.token);

  async function request(path: string, opts: Options = {}) {
    const headers: Record<string, string> = {
      ...((opts.headers as Record<string, string>) || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (opts.json) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.json);
    }

    const res = await fetch(path, {
      credentials: "include",
      ...opts,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
  }

  return {
    get: (path: string) => request(path, { method: "GET" }),
    post: (path: string, json?: any) => request(path, { method: "POST", json }),
    put: (path: string, json?: any) => request(path, { method: "PUT", json }),
    del: (path: string) => request(path, { method: "DELETE" }),
  };
}

export { useApi };
export default useApi;
