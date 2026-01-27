import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReactNode } from "react";

interface ModalOptions {
  cancelText?: string;
  submitText?: string;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  description?: string;
  showCancel?: boolean;
  showSubmit?: boolean;
  variant?: "default" | "destructive";
}

type ModalState = {
  isOpen: boolean;
  children: ReactNode | null;
  options: ModalOptions;
};

type GlobalState = {
  token: string | null;
  modal: ModalState;
};

const initialState: GlobalState = {
  token: null,
  modal: {
    isOpen: false,
    children: null,
    options: {
      cancelText: "Cancel",
      submitText: "Submit",
      showCancel: true,
      showSubmit: true,
      variant: "default",
    },
  },
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    openModal: (
      state,
      action: PayloadAction<{ children: ReactNode; options?: ModalOptions }>
    ) => {
      state.modal.isOpen = true;
      state.modal.children = action.payload.children;
      state.modal.options = {
        ...initialState.modal.options,
        ...action.payload.options,
      };
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.children = null;
      state.modal.options = initialState.modal.options;
    },
    updateModalOptions: (
      state,
      action: PayloadAction<Partial<ModalOptions>>
    ) => {
      state.modal.options = {
        ...state.modal.options,
        ...action.payload,
      };
    },
  },
});

export const {
  setToken,
  clearToken,
  openModal,
  closeModal,
  updateModalOptions,
} = globalSlice.actions;
export default globalSlice.reducer;
export type { ModalOptions };
