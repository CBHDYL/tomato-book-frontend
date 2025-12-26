import React from "react";
import type { PomodoroMode, PomodoroSession, PomodoroSettings } from "./types";

export type PomodoroState = {
  mode: PomodoroMode;
  isRunning: boolean;
  secondsLeft: number;
  settings: PomodoroSettings;
  currentTaskId: string | null;
  sessions: PomodoroSession[];
};

export type PomodoroActions = {
  setTask: (taskId: string | null) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  switchMode: (m: PomodoroMode) => void;
  updateSettings: (s: PomodoroSettings) => void;
};

export type PomodoroCtxValue = PomodoroState & PomodoroActions;

export const PomodoroCtx = React.createContext<PomodoroCtxValue | null>(null);

/**
 * React hook: usePomodoro.
 */
export function usePomodoro(): PomodoroCtxValue {
  const ctx = React.useContext(PomodoroCtx);
  if (!ctx) throw new Error("usePomodoro must be used within PomodoroProvider");
  return ctx;
}

/**
 * defaultSettings.
 */
export function defaultSettings(): PomodoroSettings {
  return { focusMinutes: 25, breakMinutes: 5 };
}

/**
 * secondsFor.
 */
export function secondsFor(mode: PomodoroMode, settings: PomodoroSettings) {
  return (mode === "focus" ? settings.focusMinutes : settings.breakMinutes) * 60;
}