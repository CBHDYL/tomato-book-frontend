import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiAdminStats,
  apiAdminListUsers,
  apiAdminSetUserStatus,
  apiAdminSetUserRole,
  apiAdminResetUserPassword,
  apiAdminDeleteUser,
  apiAdminListTasks,
  apiAdminDeleteTask,
  apiAdminBatchDeleteTasks,
  apiAdminListPomodoro,
  apiAdminDeletePomodoro,
  apiAdminBatchDeletePomodoro,
  apiAdminUserInsights,
  apiAdminRecomputeInsights,
} from "./adminApi";

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  users: (params: any) => ["admin", "users", params] as const,
  tasks: (params: any) => ["admin", "tasks", params] as const,
  pomodoro: (params: any) => ["admin", "pomodoro", params] as const,
  insights: (params: any) => ["admin", "insights", params] as const,
};

/**
 * React hook: useAdminStatsQuery.
 */
export function useAdminStatsQuery() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: apiAdminStats,
    staleTime: 30 * 1000,
  });
}

/**
 * React hook: useAdminUsersQuery.
 */
export function useAdminUsersQuery(params: {
  page: number;
  size: number;
  q?: string;
}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => apiAdminListUsers(params),
    
    placeholderData: (prev) => prev,
  });
}

/**
 * React hook: useAdminSetUserStatus.
 */
export function useAdminSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      apiAdminSetUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

/**
 * React hook: useAdminSetUserRole.
 */
export function useAdminSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: "USER" | "ADMIN" }) =>
      apiAdminSetUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

/**
 * React hook: useAdminResetUserPassword.
 */
export function useAdminResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      apiAdminResetUserPassword(id, newPassword),
  });
}

/**
 * React hook: useAdminDeleteUser.
 */
export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiAdminDeleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

/**
 * React hook: useAdminTasksQuery.
 */
export function useAdminTasksQuery(params: {
  page: number;
  size: number;
  userId?: number;
  status?: string;
  priority?: string;
}) {
  return useQuery({
    queryKey: adminKeys.tasks(params),
    queryFn: () => apiAdminListTasks(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * React hook: useAdminDeleteTask.
 */
export function useAdminDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiAdminDeleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });
}

/**
 * React hook: useAdminBatchDeleteTasks.
 */
export function useAdminBatchDeleteTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => apiAdminBatchDeleteTasks(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });
}

/**
 * React hook: useAdminPomodoroQuery.
 */
export function useAdminPomodoroQuery(params: {
  page: number;
  size: number;
  userId?: number;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: adminKeys.pomodoro(params),
    queryFn: () => apiAdminListPomodoro(params),
    placeholderData: (prev) => prev,
  });
}

/**
 * React hook: useAdminDeletePomodoro.
 */
export function useAdminDeletePomodoro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiAdminDeletePomodoro(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "pomodoro"] }),
  });
}

/**
 * React hook: useAdminBatchDeletePomodoro.
 */
export function useAdminBatchDeletePomodoro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => apiAdminBatchDeletePomodoro(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "pomodoro"] }),
  });
}

/**
 * React hook: useAdminInsightsQuery.
 */
export function useAdminInsightsQuery(params: {
  userId: number;
  range?: string;
  ai?: number;
}) {
  return useQuery({
    queryKey: adminKeys.insights(params),
    queryFn: () => apiAdminUserInsights(params),
    enabled: !!params.userId,
  });
}

/**
 * React hook: useAdminRecomputeInsights.
 */
export function useAdminRecomputeInsights() {
  return useMutation({
    mutationFn: (params: { userId: number; range?: string; ai?: number }) =>
      apiAdminRecomputeInsights(params),
  });
}