import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setToken, clearToken } from "@/store/globalSlice";
import { clearUser } from "@/store/userSlice";

export function useToken() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.global.token);

  useEffect(() => {
    // Check if token exists in Redux
    if (!token && typeof window !== "undefined") {
      // Check sessionStorage
      const storedToken = sessionStorage.getItem("authToken");
      if (storedToken) {
        console.log(
          "🔄 [useToken] Restoring token from sessionStorage on mount"
        );
        // Restore token to Redux
        dispatch(setToken(storedToken));
      }
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    // Clear Redux state
    dispatch(clearToken());
    dispatch(clearUser());

    // Clear sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }

    router.push("/auth");
  };

  const getToken = (): string | null => {
    if (token) return token;
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("authToken");
      if (storedToken) {
        dispatch(setToken(storedToken));
        return storedToken;
      }
    }
    return null;
  };

  const saveToken = (newToken: string) => {
    console.log(
      "🔑 [useToken] saveToken called with token:",
      newToken.substring(0, 20) + "..."
    );
    dispatch(setToken(newToken));
    console.log("📤 [useToken] Dispatched setToken action to Redux");
  };

  const removeToken = () => {
    handleLogout();
  };

  const isAuthenticated =
    !!token ||
    (typeof window !== "undefined" && !!sessionStorage.getItem("authToken"));

  return {
    token,
    getToken,
    saveToken,
    removeToken,
    isAuthenticated,
    logout: handleLogout,
  };
}
