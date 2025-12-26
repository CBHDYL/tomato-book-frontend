import dayjs from "dayjs";
import { Task } from "../features/tasks/types";

/**
 * seedTasks.
 */
export function seedTasks(now = dayjs()): Task[] {
  const iso = (d: dayjs.Dayjs) => d.toISOString();
  const base = now.startOf("day");

  return [
    {
      id: "t1",
      title: "birthday party",
      description: "Buy decorations and confirm guest list.",
      priority: "high",
      tag: "personal",
      status: "active",
      dueAt: base.add(2, "day").toISOString(),
      createdAt: iso(now.subtract(3, "day")),
      updatedAt: iso(now.subtract(1, "day"))
    },
    {
      id: "t2",
      title: "ITEC 3230 – finalize usability report",
      description: "Write analysis section + include heuristics results.",
      priority: "high",
      tag: "school",
      status: "active",
      dueAt: base.add(1, "day").toISOString(),
      createdAt: iso(now.subtract(5, "day")),
      updatedAt: iso(now.subtract(2, "day"))
    },
    {
      id: "t3",
      title: "Implement task filters UI",
      description: "Search + priority + status + due date filters.",
      priority: "medium",
      tag: "project",
      status: "active",
      dueAt: base.add(5, "day").toISOString(),
      createdAt: iso(now.subtract(2, "day")),
      updatedAt: iso(now.subtract(2, "day"))
    },
    {
      id: "t4",
      title: "Refactor dashboard stats cards",
      description: "",
      priority: "low",
      tag: "project",
      status: "completed",
      dueAt: base.subtract(1, "day").toISOString(),
      createdAt: iso(now.subtract(10, "day")),
      updatedAt: iso(now.subtract(7, "day")),
      completedAt: iso(now.subtract(7, "day"))
    },
    {
      id: "t5",
      title: "Pay phone bill",
      description: "",
      priority: "medium",
      tag: "personal",
      status: "active",
      dueAt: base.subtract(2, "day").toISOString(),
      createdAt: iso(now.subtract(6, "day")),
      updatedAt: iso(now.subtract(1, "day"))
    }
  ];
}