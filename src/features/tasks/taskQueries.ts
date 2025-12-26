import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiBulkDeleteTasks,
  apiBulkUpdateStatus,
  apiCreateTask,
  apiDeleteTask,
  apiListTasks,
  apiReorder,
  apiUpdateTask,
} from "./taskApi";
import type { Status, TaskCreate, TaskUpdate } from "./types";

export const taskKeys = {
  all: ["tasks"] as const,
};

/**
 * React hook: useTasks.
 */
export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: apiListTasks,
  });
}

/**
 * React hook: useCreateTask.
 */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskCreate) => apiCreateTask(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

/**
 * React hook: useUpdateTask.
 */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TaskUpdate }) =>
      apiUpdateTask(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

/**
 * React hook: useDeleteTask.
 */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDeleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

/**
 * React hook: useReorderTasks.
 */
export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => apiReorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

/** ✅ Bulk delete */
export function useBulkDeleteTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => apiBulkDeleteTasks(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

/** ✅ Bulk status */
export function useBulkUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: Status }) =>
      apiBulkUpdateStatus(ids, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}