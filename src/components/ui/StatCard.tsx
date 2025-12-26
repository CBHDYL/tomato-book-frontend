import { LucideIcon } from "lucide-react";

/**
 * UI component: StatCard.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-neutral-200">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-4xl font-semibold tracking-tight">{value}</div>
        <Icon className="h-5 w-5 text-neutral-400" />
      </div>
    </div>
  );
}