"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeModal } from "@/store/globalSlice";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GlobalModal() {
    const dispatch = useAppDispatch();
    const { isOpen, children, options } = useAppSelector((state) => state.global.modal);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        if (options.onCancel) {
            options.onCancel();
        }
        dispatch(closeModal());
    };

    const handleSubmit = async () => {
        if (options.onSubmit) {
            setIsSubmitting(true);
            try {
                await options.onSubmit();
                dispatch(closeModal());
            } catch (error) {
                console.error("Modal submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            dispatch(closeModal());
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <AlertDialogContent>
                {(options.title || options.description) && (
                    <AlertDialogHeader>
                        {options.title && <AlertDialogTitle>{options.title}</AlertDialogTitle>}
                        {options.description && (
                            <AlertDialogDescription>{options.description}</AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                )}

                {children && <div className="py-4">{children}</div>}

                <AlertDialogFooter>
                    {options.showCancel !== false && (
                        <AlertDialogCancel onClick={handleClose} disabled={isSubmitting}>
                            {options.cancelText || "Cancel"}
                        </AlertDialogCancel>
                    )}
                    {options.showSubmit !== false && (
                        <AlertDialogAction
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={
                                options.variant === "destructive"
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : ""
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                options.submitText || "Submit"
                            )}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
