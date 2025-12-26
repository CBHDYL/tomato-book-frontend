import React from "react";
import { ToastCtx } from "./toast";

type ToastType = "info" | "success" | "error";
type Toast = { id: string; message: string; type: ToastType };

/**
 * UI component: ToastProvider.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(16).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
    },
    []
  );

  const api = React.useMemo(
    () => ({
      push: (message: string) => push(message, "info"),
      success: (message: string) => push(message, "success"),
      error: (message: string) => push(message, "error"),
    }),
    [push]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-2xl border px-4 py-3 shadow",
              t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : t.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-white border-neutral-200 text-neutral-900",
            ].join(" ")}
          >
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}