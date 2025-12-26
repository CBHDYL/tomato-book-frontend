import React from "react";
import { cx } from "../../utils/cx";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md";

const variantCls: Record<Variant, string> = {
  primary: "bg-red-600 text-white hover:bg-red-700 border-red-600",
  ghost: "bg-transparent hover:bg-neutral-50 border-transparent",
  outline: "bg-white hover:bg-neutral-50 border-neutral-200",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
};

const sizeCls: Record<Size, string> = {
  sm: "px-3 py-2 text-sm rounded-xl",
  md: "px-4 py-2.5 text-sm rounded-2xl"
};

/**
 * UI component: Button.
 */
export function Button({
  variant = "outline",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 border font-medium transition focus:outline-none focus:ring-2 focus:ring-red-200",
        variantCls[variant],
        sizeCls[size],
        className
      )}
      {...props}
    />
  );
}