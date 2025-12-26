import React from "react";
import { cx } from "../../utils/cx";

export type ChipTone = "neutral" | "red" | "amber" | "green" | "blue";

/**
 * UI component: Chip.
 */
export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: ChipTone;
}) {
  const styles: Record<ChipTone, string> = {
    neutral: "bg-white text-neutral-800 border-neutral-200",
    red: "bg-white text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
}