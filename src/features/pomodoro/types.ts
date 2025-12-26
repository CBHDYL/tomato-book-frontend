export type PomodoroMode = "focus" | "break";

export type PomodoroSettings = {
  focusMinutes: number;
  breakMinutes: number;
};

export type PomodoroSession = {
  id: string;
  startedAt: string;
  endedAt: string;
  mode: PomodoroMode;
  minutes: number;
  taskId?: string | null;
};