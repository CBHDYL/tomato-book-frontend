import React from "react";
import { cx } from "../../utils/cx";
import { X } from "lucide-react";

/**
 * UI component: Modal.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className={cx(
          "relative w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white shadow-xl",
          
          "max-h-[90vh] flex flex-col overflow-hidden",
          // mobile full screen
          "max-md:h-full max-md:max-w-none max-md:rounded-none max-md:border-0",
          className
        )}
      >
        {/* Header */}
        {title ? (
          <div className="px-6 py-5 border-b border-neutral-200 max-md:px-4 max-md:py-3 max-md:flex max-md:items-center max-md:justify-between">
            <div className="min-w-0">
              {}
              {title}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-neutral-100 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-neutral-700" />
            </button>
          </div>
        ) : null}

        {}
        <div className="flex-1 overflow-y-auto p-6 max-md:p-4">{children}</div>
      </div>
    </div>
  );
}