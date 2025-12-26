import dayjs from "dayjs";
import type { Task } from "../tasks/types";
import { daysUntil, isOverdue } from "../../utils/date";

type Factors = {
  due: number;        // 0-40
  priority: number;   // 0-30
  overdue: number;    // 0-20
  recency: number;    // 0-10 (how long since updated)
};

/**
 * scoreTask.
 */
export function scoreTask(task: Task): { score: number; factors: Factors; reason: string } {
  const d = daysUntil(task.dueAt ?? null);
  const overdue = isOverdue(task.dueAt ?? null);

  let dueScore = 0;
  if (task.dueAt) {
    if (overdue) dueScore = 40;
    else if (d === 0) dueScore = 36;
    else if (d !== null && d <= 1) dueScore = 32;
    else if (d !== null && d <= 3) dueScore = 26;
    else if (d !== null && d <= 7) dueScore = 18;
    else dueScore = 8;
  }

  const pr = task.priority === "high" ? 30 : task.priority === "medium" ? 18 : 10;
  const od = overdue ? 20 : 0;

  const updatedDays = dayjs().diff(dayjs(task.updatedAt), "day");
  const rec = Math.max(0, 10 - Math.min(10, updatedDays));

  const score = clamp(dueScore + pr + od + rec, 0, 100);

  const parts: string[] = [];
  if (overdue) parts.push("overdue");
  if (task.priority === "high") parts.push("high priority");
  if (d === 0) parts.push("due today");
  if (d !== null && d > 0 && d <= 3) parts.push("due soon");
  if (updatedDays >= 5) parts.push("not touched recently");

  const reason = parts.length ? parts.join(" • ") : "balanced recommendation";

  return {
    score,
    factors: { due: dueScore, priority: pr, overdue: od, recency: rec },
    reason
  };
}

/**
 * topRecommendations.
 */
export function topRecommendations(tasks: Task[], limit = 3) {
  return tasks
    .filter((t) => t.status === "active")
    .map((t) => ({ task: t, ...scoreTask(t) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}