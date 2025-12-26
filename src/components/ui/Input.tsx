import * as React from "react";
import { cx } from "../../utils/cx";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <input
      ref={ref}
      className={cx(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200",
        className
      )}
      {...rest}
    />
  );
});

Input.displayName = "Input";