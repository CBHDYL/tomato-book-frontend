export type Priority = "low" | "medium" | "high";
export type Status = "active" | "completed";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tag?: string; // personal, school, work
  status: Status;
  dueAt?: string | null; // ISO string
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

export type TaskCreate = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "completedAt"
>;
export type TaskUpdate = Partial<Omit<Task, "id" | "createdAt">>;

export type TaskQuery = {
  q?: string;
  priority?: Priority | "all";
  status?: Status | "all";
  due?: "all" | "overdue" | "today" | "week" | "none";
  sort?: "dueAsc" | "dueDesc" | "createdDesc" | "priorityDesc";
};