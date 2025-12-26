// src/app/uiModeStore.ts
import { create } from "zustand";

export type UIMode = "user" | "admin";

interface UIModeState {
  mode: UIMode;
  setMode: (m: UIMode) => void;
  toggle: () => void;
  reset: () => void;
}


export const useUIModeStore = create<UIModeState>((set, get) => ({
  mode: "user",
  setMode: (m) => set({ mode: m }),
  toggle: () => set({ mode: get().mode === "user" ? "admin" : "user" }),
  reset: () => set({ mode: "user" }),
}));