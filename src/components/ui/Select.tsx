import React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cx } from "../../utils/cx";

type Option = {
  value: string;
  label: string;
};

/**
 * UI component: Select.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  disabled,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  
  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cx(
          "w-full flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-2.5 text-sm",
          "shadow-sm hover:shadow-md transition border-neutral-300",
          "focus:outline-none focus:ring-2 focus:ring-red-200",
          "disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
        )}
      >
        <span
          className={cx(selected ? "text-neutral-900" : "text-neutral-500")}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cx(
            "h-4 w-4 text-neutral-500 transition",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute z-50 mt-2 w-full border-neutral-300 rounded-2xl border bg-white shadow-xl p-1">
          {options.map((o) => {
            const isSel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cx(
                  "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm text-left",
                  "hover:bg-neutral-50 transition",
                  isSel && "bg-neutral-100 font-semibold"
                )}
              >
                <span>{o.label}</span>
                {isSel && <Check className="h-4 w-4 text-red-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}