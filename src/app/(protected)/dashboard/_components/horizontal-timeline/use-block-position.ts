import { useMemo } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { MINUTE_GRID } from "./constants";

export type BlockPosition = {
  left: number; // percentage (0-100)
  width: number; // percentage (0-100)
  isStartBlock: boolean;
  isEndBlock: boolean;
  isContinuation: boolean;
  continuesNext: boolean;
};

/**
 * Calculate horizontal position for a time block within a specific hour row.
 * Handles multi-hour tasks by calculating the visible portion within the row.
 */
export function calculateHorizontalPosition(
  startAt: string,
  endAt: string,
  rowHour: number
): BlockPosition {
  const [startH, startM] = startAt.split(":").map(Number);
  const [endH, endM] = endAt.split(":").map(Number);

  // Determine if task starts/ends in this hour
  const isStartBlock = startH === rowHour;

  // Task ends in this hour if:
  // 1. endH equals rowHour (e.g., 12:20 - 12:50 in row 12)
  // 2. endH is rowHour + 1 AND endM is 0 (e.g., 12:20 - 13:00 ends in row 12 at :60)
  const endsAtNextHourExactly = endH === (rowHour + 1) % 24 && endM === 0;
  const isEndBlock = endH === rowHour || endsAtNextHourExactly;

  const isContinuation = !isStartBlock;
  const continuesNext = !isEndBlock;

  // Calculate minutes within this hour row
  const startMinuteInRow = isStartBlock ? startM : 0;
  // If ends at next hour :00, treat as ending at :60 of current hour
  const endMinuteInRow = endsAtNextHourExactly ? 60 : (endH === rowHour ? endM : 60);

  // Convert to percentages
  const left = (startMinuteInRow / 60) * 100;
  const width = ((endMinuteInRow - startMinuteInRow) / 60) * 100;

  return {
    left,
    width,
    isStartBlock,
    isEndBlock,
    isContinuation,
    continuesNext,
  };
}

/**
 * Hook to calculate block position with memoization.
 */
export function useBlockPosition(
  item: TimeBoxItem,
  rowHour: number
): BlockPosition {
  return useMemo(
    () => calculateHorizontalPosition(item.startAt, item.endAt, rowHour),
    [item.startAt, item.endAt, rowHour]
  );
}

/**
 * Get all hour indices that a task spans.
 * Used to render split blocks across multiple hour rows.
 */
export function getTaskHourSpan(item: TimeBoxItem): number[] {
  const [startH] = item.startAt.split(":").map(Number);
  const [endH, endM] = item.endAt.split(":").map(Number);

  const hours: number[] = [];
  let h = startH;

  // Handle tasks that span across multiple hours
  while (true) {
    hours.push(h);
    if (h === endH) {
      // If task ends exactly at :00, don't include that hour
      if (endM === 0 && hours.length > 1) {
        hours.pop();
      }
      break;
    }
    h = (h + 1) % 24;
    // Safety: prevent infinite loop for same-hour tasks
    if (hours.length > 24) break;
  }

  return hours;
}

/**
 * Snap a minute value to the nearest grid interval.
 */
export function snapToGrid(minute: number, grid: number = MINUTE_GRID): number {
  return Math.round(minute / grid) * grid;
}

/**
 * Snap a minute value to the grid interval it falls within (floor-based).
 * More accurate for click-based positioning.
 */
export function snapToGridFloor(minute: number, grid: number = MINUTE_GRID): number {
  return Math.floor(minute / grid) * grid;
}

/**
 * Calculate the minute from a click position within a row.
 * Uses floor-based snapping for more accurate hit-testing.
 */
export function getMinuteFromPosition(
  clickX: number,
  rowLeft: number,
  rowWidth: number
): number {
  const relativeX = clickX - rowLeft;
  // Clamp to valid range first
  const clampedX = Math.max(0, Math.min(rowWidth, relativeX));
  const percentage = clampedX / rowWidth;
  const rawMinute = percentage * 60;
  // Use floor-based snapping for accurate grid slot detection
  // Max 50 to leave room for min duration (10 min)
  return snapToGridFloor(Math.min(50, rawMinute), MINUTE_GRID);
}

/**
 * Format time string from hour and minute.
 */
export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Calculate end time from start time and duration.
 */
export function calculateEndTime(startAt: string, durationMin: number): string {
  const [hours, minutes] = startAt.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMin;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return formatTime(endHours, endMinutes);
}
