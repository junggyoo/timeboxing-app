"use client";

import { useMemo } from "react";
import { useFsmStore } from "./use-timebox-fsm";
import { formatTime } from "../lib/format-time";
import { DEFAULT_BREAK_DURATION_MS } from "../constants";

/**
 * Hook for break mode state and actions.
 * Uses the FSM-based timer system.
 *
 * Usage:
 * ```tsx
 * function BreakCountdown() {
 *   const {
 *     isBreakMode,
 *     breakRemainingMs,
 *     breakProgress,
 *     formattedBreakTime,
 *     skipBreak,
 *   } = useBreakMode();
 *
 *   if (!isBreakMode) return null;
 *
 *   return (
 *     <div>
 *       <p>{formattedBreakTime}</p>
 *       <button onClick={skipBreak}>Skip Break</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakMode() {
  // State from FSM store
  const state = useFsmStore((s) => s.state);
  const context = useFsmStore((s) => s.context);
  const dispatch = useFsmStore((s) => s.dispatch);

  // Derived state
  const isBreakReady = state === "break_ready";
  const isBreakRunning = state === "break_running";
  const isBreakCompleted = state === "break_completed";
  const isBreakMode = isBreakRunning || isBreakCompleted;
  const isFocusMode =
    state === "focus_running" ||
    state === "focus_paused" ||
    state === "overtime_running";
  const isIdle = state === "idle";

  const breakDurationMs = context.breakDurationMs || DEFAULT_BREAK_DURATION_MS;
  const breakRemainingMs = context.breakRemainingMs;
  const breakProgress =
    breakDurationMs > 0 ? 1 - breakRemainingMs / breakDurationMs : 0;

  // Formatted time for display
  const formattedBreakTime = useMemo(() => {
    return formatTime(breakRemainingMs, false);
  }, [breakRemainingMs]);

  // Actions
  const startBreak = () => dispatch({ type: "START_BREAK" });
  const skipBreak = () => dispatch({ type: "SKIP_BREAK" });
  const dismissBreak = () => dispatch({ type: "DISMISS_BREAK" });

  return {
    // State
    breakMode: isBreakMode ? "break" : isFocusMode ? "focus" : "idle",
    isBreakReady,
    isBreakRunning,
    isBreakCompleted,
    isBreakMode,
    isFocusMode,
    isIdle,
    breakDurationMs,
    breakRemainingMs,
    breakProgress,
    formattedBreakTime,

    // Actions
    startBreak,
    skipBreak,
    dismissBreak,
  };
}
