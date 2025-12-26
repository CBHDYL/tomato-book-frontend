import dayjs from "dayjs";

/**
 * formatDateShort.
 */
export function formatDateShort(iso?: string | null) {
  if (!iso) return "No due date";
  return dayjs(iso).format("MMM DD, YYYY");
}

/**
 * isOverdue.
 */
export function isOverdue(dueAt?: string | null) {
  if (!dueAt) return false;
  return dayjs(dueAt).endOf("day").isBefore(dayjs());
}

/**
 * daysUntil.
 */
export function daysUntil(dueAt?: string | null) {
  if (!dueAt) return null;
  return dayjs(dueAt).startOf("day").diff(dayjs().startOf("day"), "day");
}