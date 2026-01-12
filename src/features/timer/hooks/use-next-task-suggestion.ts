"use client";

import { useMemo } from "react";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { TimeBoxItem } from "@/features/dashboard/types";

/**
 * Reason why a task was suggested
 */
export type SuggestionReason =
  | "catch_up" // Task start time has passed (need to catch up)
  | "upcoming" // Task is coming up soon
  | "next_in_queue"; // First available task in queue

/**
 * Suggested task with context about why it was selected
 */
export type SuggestedTask = {
  item: TimeBoxItem;
  reason: SuggestionReason;
  minutesOffset: number; // Negative = past, positive = future
};

/**
 * Convert HH:MM time string to epoch timestamp for the selected date
 */
function timeToEpoch(timeStr: string, selectedDate: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(selectedDate);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

/**
 * Hook for suggesting the next task to work on
 *
 * Algorithm:
 * 1. Filter out completed tasks (status === "done")
 * 2. Convert startAt (HH:MM) to epoch for comparison
 * 3. Sort by startAt time
 * 4. Find the task with startAt closest to current time:
 *    - If startAt is in the past → suggest it (catch up)
 *    - If startAt is in the future → suggest nearest upcoming
 *
 * Usage:
 * ```tsx
 * const suggestion = useNextTaskSuggestion();
 *
 * if (suggestion) {
 *   return (
 *     <div>
 *       <span>Up Next: {suggestion.item.title}</span>
 *       {suggestion.reason === "catch_up" && (
 *         <Badge>Catch up</Badge>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useNextTaskSuggestion(): SuggestedTask | null {
  const timeBoxItems = useDashboardStore((s) => s.timeBox);
  const selectedDate = useDashboardStore((s) => s.selectedDate);

  const suggestion = useMemo(() => {
    const now = Date.now();

    // Filter: exclude completed tasks
    const pendingTasks = timeBoxItems.filter(
      (item) => item.status !== "done"
    );

    if (pendingTasks.length === 0) return null;

    // Convert startAt (HH:MM) to epoch for comparison
    const tasksWithEpoch = pendingTasks.map((item) => ({
      item,
      startEpoch: timeToEpoch(item.startAt, selectedDate),
    }));

    // Sort by startAt time (earliest first)
    tasksWithEpoch.sort((a, b) => a.startEpoch - b.startEpoch);

    // Find the best suggestion based on proximity to current time
    let bestMatch: SuggestedTask | null = null;
    let smallestOffset = Infinity;

    for (const { item, startEpoch } of tasksWithEpoch) {
      const offset = startEpoch - now;
      const offsetMinutes = Math.round(offset / (60 * 1000));
      const absOffset = Math.abs(offset);

      if (absOffset < smallestOffset) {
        smallestOffset = absOffset;
        bestMatch = {
          item,
          reason: offset < 0 ? "catch_up" : "upcoming",
          minutesOffset: offsetMinutes,
        };
      }
    }

    // If no time-based match found, suggest first in queue
    if (!bestMatch && tasksWithEpoch.length > 0) {
      const first = tasksWithEpoch[0];
      const offset = first.startEpoch - now;
      bestMatch = {
        item: first.item,
        reason: "next_in_queue",
        minutesOffset: Math.round(offset / (60 * 1000)),
      };
    }

    return bestMatch;
  }, [timeBoxItems, selectedDate]);

  return suggestion;
}

/**
 * Hook for getting all pending tasks sorted by priority
 */
export function usePendingTasks(): TimeBoxItem[] {
  const timeBoxItems = useDashboardStore((s) => s.timeBox);
  const selectedDate = useDashboardStore((s) => s.selectedDate);

  return useMemo(() => {
    const now = Date.now();

    // Filter: exclude completed tasks
    const pendingTasks = timeBoxItems.filter(
      (item) => item.status !== "done"
    );

    // Sort by proximity to current time
    return pendingTasks.sort((a, b) => {
      const aEpoch = timeToEpoch(a.startAt, selectedDate);
      const bEpoch = timeToEpoch(b.startAt, selectedDate);
      const aOffset = Math.abs(aEpoch - now);
      const bOffset = Math.abs(bEpoch - now);
      return aOffset - bOffset;
    });
  }, [timeBoxItems, selectedDate]);
}
