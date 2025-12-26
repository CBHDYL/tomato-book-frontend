import api from "../../services/http";
import type { Status, Task, TaskCreate, TaskUpdate } from "./types";
import type { ApiResult } from "../../services/apiResult";

type Result<T> = { code: number; msg?: string; data: T };


type BackendTaskDto = {
  id: number;
  title: string;
  description?: string;
  priority: string; // "low" | "medium" | "high"
  status: string; // "active" | "completed"
  deadline?: string | null; // LocalDateTime: "YYYY-MM-DDTHH:mm:ss"
  createTime?: string | null; // LocalDateTime
  updateTime?: string | null; // LocalDateTime
};

function unwrap<T>(res: any): T {
  const d = res?.data;
  if (d && typeof d === "object" && "data" in d) return d.data as T;
  return d as T;
}

function localDateTimeToISO(ldt: string): string {
  const [date, time = "00:00:00"] = ldt.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm, ss] = time.split(":").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0);
  return dt.toISOString();
}

function isoToLocalDateTime(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${MM}-${DD}T${hh}:${mm}:${ss}`;
}

function adaptIn(b: BackendTaskDto): Task {
  const now = new Date().toISOString();
  const createdAt = b.createTime ? localDateTimeToISO(b.createTime) : now;
  const updatedAt = b.updateTime ? localDateTimeToISO(b.updateTime) : createdAt;

  return {
    id: String(b.id),
    title: b.title,
    description: b.description ?? "",
    priority: b.priority as Task["priority"],
    status: b.status as Task["status"],
    tag: undefined,
    dueAt: b.deadline ? localDateTimeToISO(b.deadline) : null,
    createdAt,
    updatedAt,
    completedAt: b.status === "completed" ? updatedAt : null,
  };
}

function adaptOutCreate(input: TaskCreate) {
  return {
    title: input.title,
    description: input.description ?? "",
    priority: input.priority,
    status: input.status,
    deadline: input.dueAt ? isoToLocalDateTime(input.dueAt) : null,
  };
}

function adaptOutUpdate(patch: TaskUpdate) {
  return {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.description !== undefined
      ? { description: patch.description ?? "" }
      : {}),
    ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.dueAt !== undefined
      ? { deadline: patch.dueAt ? isoToLocalDateTime(patch.dueAt) : null }
      : {}),
  };
}

/**
 * API helper: apiListTasks.
 */
export async function apiListTasks(): Promise<Task[]> {
  const res = await api.get("/tasks");
  const list = unwrap<BackendTaskDto[]>(res) ?? [];
  return list.map(adaptIn);
}

/**
 * API helper: apiCreateTask.
 */
export async function apiCreateTask(input: TaskCreate): Promise<Task> {
  const res = await api.post("/tasks", adaptOutCreate(input));
  const created = unwrap<BackendTaskDto>(res);
  return adaptIn(created);
}

/**
 * API helper: apiUpdateTask.
 */
export async function apiUpdateTask(
  id: string,
  patch: TaskUpdate
): Promise<Task> {
  const res = await api.put("/tasks/" + id, adaptOutUpdate(patch));
  const updated = unwrap<BackendTaskDto>(res);
  return adaptIn(updated);
}

/**
 * API helper: apiDeleteTask.
 */
export async function apiDeleteTask(id: string): Promise<void> {
  await api.delete("/tasks/" + id);
}


/**
 * API helper: apiBulkDeleteTasks.
 */
export async function apiBulkDeleteTasks(ids: string[]): Promise<void> {
  const payload = ids.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  await api.post("/tasks/bulk-delete", payload);
}


/**
 * API helper: apiBulkUpdateStatus.
 */
export async function apiBulkUpdateStatus(
  ids: string[],
  status: Status
): Promise<void> {
  const payload = {
    ids: ids.map((x) => Number(x)).filter((n) => Number.isFinite(n)),
    status,
  };
  await api.post("/tasks/bulk-status", payload);
}


/**
 * API helper: apiReorder.
 */
export async function apiReorder(_ids: string[]): Promise<void> {
  return;
}