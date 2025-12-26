import React from "react";
import { cx } from "../../utils/cx";

/**
 * UI component: Card.
 */
export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "border-1 shadow-sm rounded-2xl border-neutral-200 bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * UI component: CardHeader.
 */
export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b border-neutral-200 flex items-start justify-between gap-3">
      <div>
        <div className="font-semibold">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-sm text-neutral-500">{subtitle}</div>
        ) : null}
      </div>
      {right}
    </div>
  );
}

/**
 * UI component: CardBody.
 */
export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-5">{children}</div>;
}