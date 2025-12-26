// src/features/ai/aiMode.ts
import * as React from "react";

const KEY = "tomato.ai.enabled.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw == null) return false;
    return raw === "1" || raw === "true";
  } catch {
    return false;
  }
}

function write(next: boolean) {
  try {
    localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/**
 * getAiEnabled.
 */
export function getAiEnabled() {
  return read();
}

/**
 * setAiEnabled.
 */
export function setAiEnabled(next: boolean) {
  write(next);
  emit();
  
  window.dispatchEvent(new CustomEvent("tomato-ai-changed"));
}

function subscribe(cb: Listener) {
  listeners.add(cb);

  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  const onLocal = () => cb();

  window.addEventListener("storage", onStorage);
  window.addEventListener("tomato-ai-changed", onLocal);

  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("tomato-ai-changed", onLocal);
  };
}

/**
 * React hook: useAiMode.
 */
export function useAiMode() {
  const enabled = React.useSyncExternalStore(
    subscribe,
    () => read(),
    () => false
  );

  const setEnabled = React.useCallback((next: boolean) => {
    setAiEnabled(next);
  }, []);

  const toggle = React.useCallback(() => {
    setAiEnabled(!read());
  }, []);

  return { enabled, setEnabled, toggle };
}