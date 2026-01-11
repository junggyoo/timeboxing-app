"use client";

import { useMemo } from "react";
import { useTimerStore } from "../store/timer-store";
import { formatTime } from "../lib/format-time";

/**
 * Hook for break mode state and actions.
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
  // State from store
  const breakMode = useTimerStore((s) => s.breakMode);
  const breakDurationMs = useTimerStore((s) => s.breakDurationMs);
  const breakRemainingMs = useTimerStore((s) => s.breakRemainingMs);
  const breakProgress = useTimerStore((s) => s.breakProgress);

  // Actions from store
  const startBreak = useTimerStore((s) => s.startBreak);
  const endBreak = useTimerStore((s) => s.endBreak);
  const skipBreak = useTimerStore((s) => s.skipBreak);

  // Derived state
  const isBreakMode = breakMode === "break";
  const isFocusMode = breakMode === "focus";
  const isIdle = breakMode === "idle";

  // Formatted time for display
  const formattedBreakTime = useMemo(() => {
    return formatTime(breakRemainingMs, false);
  }, [breakRemainingMs]);

  return {
    // State
    breakMode,
    isBreakMode,
    isFocusMode,
    isIdle,
    breakDurationMs,
    breakRemainingMs,
    breakProgress,
    formattedBreakTime,

    // Actions
    startBreak,
    endBreak,
    skipBreak,
  };
}
