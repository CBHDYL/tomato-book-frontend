import api from "../../services/http";
import type {
  ApiResult,
  AdminStats,
  SpringPage,
  AdminUser,
  AdminPomodoroList,
  RecommendationsResponse,
} from "./adminTypes";
import type { Task } from "../tasks/types";

/**
 * API helper: apiAdminStats.
 */
export async function apiAdminStats(): Promise<AdminStats> {
  const res = await api.get<ApiResult<Record<string, any>>>("/admin/stats");
  return res.data.data as AdminStats;
}

/**
 * API helper: apiAdminListUsers.
 */
export async function apiAdminListUsers(params: {
  page: number;
  size: number;
  q?: string;
}): Promise<SpringPage<AdminUser>> {
  const res = await api.get<ApiResult<SpringPage<AdminUser>>>("/admin/users", {
    params,
  });
  return res.data.data;
}

/**
 * API helper: apiAdminSetUserStatus.
 */
export async function apiAdminSetUserStatus(id: number, status: number) {
  const res = await api.post<ApiResult<any>>(`/admin/users/${id}/status`, {
    status,
  });
  return res.data.data;
}

/**
 * API helper: apiAdminSetUserRole.
 */
export async function apiAdminSetUserRole(id: number, role: "USER" | "ADMIN") {
  const res = await api.post<ApiResult<any>>(`/admin/users/${id}/role`, {
    role,
  });
  return res.data.data;
}

/**
 * API helper: apiAdminResetUserPassword.
 */
export async function apiAdminResetUserPassword(
  id: number,
  newPassword: string
) {
  const res = await api.post<ApiResult<any>>(
    `/admin/users/${id}/reset-password`,
    {
      newPassword,
    }
  );
  return res.data.data;
}

/**
 * API helper: apiAdminDeleteUser.
 */
export async function apiAdminDeleteUser(id: number) {
  const res = await api.delete<ApiResult<any>>(`/admin/users/${id}`);
  return res.data.data;
}

/**
 * API helper: apiAdminListTasks.
 */
export async function apiAdminListTasks(params: {
  page: number;
  size: number;
  userId?: number;
  status?: string;
  priority?: string;
}): Promise<SpringPage<Task>> {
  const res = await api.get<ApiResult<SpringPage<Task>>>("/admin/tasks", {
    params,
  });
  return res.data.data;
}

/**
 * API helper: apiAdminDeleteTask.
 */
export async function apiAdminDeleteTask(id: number) {
  const res = await api.delete<ApiResult<any>>(`/admin/tasks/${id}`);
  return res.data.data;
}

/**
 * API helper: apiAdminBatchDeleteTasks.
 */
export async function apiAdminBatchDeleteTasks(ids: number[]) {
  const res = await api.post<ApiResult<any>>(`/admin/tasks/batch-delete`, {
    ids,
  });
  return res.data.data;
}

/**
 * API helper: apiAdminListPomodoro.
 */
export async function apiAdminListPomodoro(params: {
  page: number;
  size: number;
  userId?: number;
  from?: string;
  to?: string;
}): Promise<AdminPomodoroList> {
  const res = await api.get<ApiResult<AdminPomodoroList>>("/admin/pomodoro", {
    params,
  });
  return res.data.data;
}

/**
 * API helper: apiAdminDeletePomodoro.
 */
export async function apiAdminDeletePomodoro(id: number) {
  const res = await api.delete<ApiResult<any>>(`/admin/pomodoro/${id}`);
  return res.data.data;
}

/**
 * API helper: apiAdminBatchDeletePomodoro.
 */
export async function apiAdminBatchDeletePomodoro(ids: number[]) {
  const res = await api.post<ApiResult<any>>(`/admin/pomodoro/batch-delete`, {
    ids,
  });
  return res.data.data;
}

/**
 * API helper: apiAdminUserInsights.
 */
export async function apiAdminUserInsights(params: {
  userId: number;
  range?: string;
  ai?: number;
}): Promise<RecommendationsResponse> {
  const { userId, ...rest } = params;
  const res = await api.get<ApiResult<RecommendationsResponse>>(
    `/admin/insights/${userId}/recommendations`,
    { params: rest }
  );
  return res.data.data;
}

/**
 * API helper: apiAdminRecomputeInsights.
 */
export async function apiAdminRecomputeInsights(params: {
  userId: number;
  range?: string;
  ai?: number;
}): Promise<RecommendationsResponse> {
  const { userId, ...rest } = params;
  const res = await api.post<ApiResult<RecommendationsResponse>>(
    `/admin/insights/${userId}/recompute`,
    null,
    { params: rest }
  );
  return res.data.data;
}