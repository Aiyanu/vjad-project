import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import globalReducer from "./globalSlice";

// Middleware to sync token to sessionStorage (client-side only)
const sessionStorageMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    // sessionStorage is only available in the browser
    if (typeof window === "undefined") return result;

    if (action.type === "global/setToken") {
      const token = store.getState().global.token;
      if (token) {
        sessionStorage.setItem("authToken", token);
      } else {
        sessionStorage.removeItem("authToken");
      }
    } else if (action.type === "global/clearToken") {
      sessionStorage.removeItem("authToken");
    }

    return result;
  };

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      global: globalReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sessionStorageMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
