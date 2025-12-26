import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPomodoroSession,
  fetchPomodoroSessions,
  type CreatePomodoroSessionPayload,
  type PomodoroSessionDto,
} from "./pomodoroApi";

const SESSIONS_KEY = (range?: string) =>
  ["pomodoro", "sessions", range ?? "all"] as const;


/**
 * React hook: usePomodoroSessionsQuery.
 */
export function usePomodoroSessionsQuery(
  range?: string,
  enabled: boolean = true
) {
  return useQuery<PomodoroSessionDto[]>({
    queryKey: SESSIONS_KEY(range),
    queryFn: () => fetchPomodoroSessions(range),
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * React hook: useCreatePomodoroSessionMutation.
 */
export function useCreatePomodoroSessionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePomodoroSessionPayload) =>
      createPomodoroSession(payload),

    onSuccess: (created) => {
      
      qc.invalidateQueries({ queryKey: ["pomodoro", "sessions"] });
    },
  });
}