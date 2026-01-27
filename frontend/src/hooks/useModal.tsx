import { useAppDispatch } from "@/store/hooks";
import { openModal, closeModal } from "@/store/globalSlice";
import { ReactNode } from "react";
import type { ModalOptions } from "@/store/globalSlice";

export function useModal() {
  const dispatch = useAppDispatch();

  const showModal = (children: ReactNode, options?: ModalOptions) => {
    dispatch(openModal({ children, options }));
  };

  const hideModal = () => {
    dispatch(closeModal());
  };

  const confirm = (
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: Partial<ModalOptions>
  ) => {
    showModal(<p className="text-sm text-muted-foreground">{message}</p>, {
      title: options?.title || "Confirm Action",
      submitText: options?.submitText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      onSubmit: onConfirm,
      variant: options?.variant || "default",
      ...options,
    });
  };

  const alert = (message: string, options?: Partial<ModalOptions>) => {
    showModal(<p className="text-sm text-muted-foreground">{message}</p>, {
      title: options?.title || "Alert",
      showCancel: false,
      submitText: options?.submitText || "OK",
      ...options,
    });
  };

  return {
    showModal,
    hideModal,
    confirm,
    alert,
  };
}
