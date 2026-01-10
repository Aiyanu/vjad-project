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

type UserState = {
  user: User | null;
};

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
