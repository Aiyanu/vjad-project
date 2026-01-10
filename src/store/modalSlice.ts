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

const initialState: ModalState = {
  isOpen: false,
  children: null,
  options: {
    cancelText: "Cancel",
    submitText: "Submit",
    showCancel: true,
    showSubmit: true,
    variant: "default",
  },
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{ children: ReactNode; options?: ModalOptions }>
    ) => {
      state.isOpen = true;
      state.children = action.payload.children;
      state.options = {
        ...initialState.options,
        ...action.payload.options,
      };
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.children = null;
      state.options = initialState.options;
    },
    updateModalOptions: (
      state,
      action: PayloadAction<Partial<ModalOptions>>
    ) => {
      state.options = {
        ...state.options,
        ...action.payload,
      };
    },
  },
});

export const { openModal, closeModal, updateModalOptions } = modalSlice.actions;
export default modalSlice.reducer;
export type { ModalOptions };
