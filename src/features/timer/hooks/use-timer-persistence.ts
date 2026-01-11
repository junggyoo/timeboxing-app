"use client";

import { useCallback } from "react";
import { PERSISTENCE_KEY } from "../constants";
import type { PersistedTimerState } from "../types";

export function useTimerPersistence() {
  const save = useCallback((state: PersistedTimerState) => {
    try {
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save timer state:", error);
    }
  }, []);

  const load = useCallback((): PersistedTimerState | null => {
    try {
      const stored = localStorage.getItem(PERSISTENCE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as PersistedTimerState;

      if (parsed.version !== 1) return null;

      return parsed;
    } catch (error) {
      console.error("Failed to load timer state:", error);
      return null;
    }
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(PERSISTENCE_KEY);
    } catch (error) {
      console.error("Failed to clear timer state:", error);
    }
  }, []);

  return { save, load, clear };
}
