import type { PomodoroMode } from "./types";
import { api } from "../../services/http";
import type { ApiResult } from "../auth/authApi";


export type PomodoroSessionDto = {
  id?: string | number;
  startedAt: string; // ISO string
  endedAt: string; // ISO string
  mode: PomodoroMode;
  minutes: number;
  taskId?: string | null;
};

export type CreatePomodoroSessionPayload = {
  startedAt: string;
  endedAt: string;
  mode: PomodoroMode;
  minutes: number;
  taskId?: string | null;
};

// POST /api/pomodoro/sessions
/**
 * API helper: createPomodoroSession.
 */
export async function createPomodoroSession(
  payload: CreatePomodoroSessionPayload
): Promise<PomodoroSessionDto> {
  const res = await api.post<ApiResult<PomodoroSessionDto>>(
    "/pomodoro/sessions",
    payload
  );
  return res.data.data;
}

// GET /api/pomodoro/sessions
// pomodoroApi.ts

// GET /api/pomodoro/sessions?range=7d|14d|30d
/**
 * API helper: fetchPomodoroSessions.
 */
export async function fetchPomodoroSessions(
  range?: string
): Promise<PomodoroSessionDto[]> {
  const res = await api.get<ApiResult<PomodoroSessionDto[]>>(
    "/pomodoro/sessions",
    { params: range ? { range } : undefined }
  );
  return res.data.data ?? [];
}