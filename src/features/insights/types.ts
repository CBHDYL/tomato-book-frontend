export type InsightRange = "7d" | "30d";

export type OverviewPoint = { day: string; completed: number; created: number };

export type Overview = {
  range: InsightRange;
  points: OverviewPoint[];
  completionRate: number; // 0-100
  avgCompletionTimeHours: number | null;
};

export type Recommendation = {
  id: string;
  title: string;
  reason: string;
  action?: { type: "openTask"; taskId: string } | { type: "goTasks" } | { type: "startFocus"; taskId?: string };
  score: number; // 0-100
};