import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  referralCode?: string;
  role?: string | null;
  isDisabled?: boolean;
  emailVerified?: boolean;
  accountName?: string | null;
  accountNumber?: string | null;
  bankCode?: string | null;
  createdAt?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
    },
    hydrateAuth: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
});

export const { setUser, setToken, clearAuth, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
