import React from "react";

export type ToastAPI = {
  push: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};
export const ToastCtx = React.createContext<ToastAPI | null>(null);

/**
 * UI component: useToast.
 */
export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}