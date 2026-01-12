import type { TimeBoxItem } from "../types";

/**
 * Pastel color palette for task blocks.
 * Each color has variants for light/dark mode.
 */
export const TASK_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700" },
  { bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700" },
  { bg: "bg-pink-100 dark:bg-pink-900/30", border: "border-pink-300 dark:border-pink-700" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", border: "border-cyan-300 dark:border-cyan-700" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-300 dark:border-indigo-700" },
] as const;

export type TaskColor = typeof TASK_COLORS[number];

/**
 * Get a color by its index in the palette.
 */
export function getTaskColorByIndex(colorIndex: number): TaskColor {
  const safeIndex = Math.abs(colorIndex) % TASK_COLORS.length;
  return TASK_COLORS[safeIndex];
}

/**
 * Convert time string to minutes for comparison.
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Find adjacent tasks (tasks that end when this one starts, or start when this ends).
 * Returns the color indices of adjacent tasks.
 */
function findAdjacentColorIndices(
  existingTasks: TimeBoxItem[],
  startAt: string,
  durationMin: number
): number[] {
  const newStartMinutes = timeToMinutes(startAt);
  const newEndMinutes = newStartMinutes + durationMin;
  const adjacentColors: number[] = [];

  for (const task of existingTasks) {
    if (task.colorIndex === undefined) continue;

    const taskStartMinutes = timeToMinutes(task.startAt);
    const taskEndMinutes = taskStartMinutes + task.durationMin;

    // Check if task ends exactly when new task starts (task is before)
    const isImmediatelyBefore = taskEndMinutes === newStartMinutes;

    // Check if task starts exactly when new task ends (task is after)
    const isImmediatelyAfter = taskStartMinutes === newEndMinutes;

    // Also check for overlapping tasks in the same time slot (within same visual row)
    // Tasks in the same hour that are close together
    const isInSameHour = Math.floor(taskStartMinutes / 60) === Math.floor(newStartMinutes / 60);
    const isClose = Math.abs(taskStartMinutes - newStartMinutes) <= 30 ||
                   Math.abs(taskEndMinutes - newEndMinutes) <= 30;

    if (isImmediatelyBefore || isImmediatelyAfter || (isInSameHour && isClose)) {
      adjacentColors.push(task.colorIndex);
    }
  }

  return adjacentColors;
}

/**
 * Get a distinct color index for a new task that avoids collision with adjacent tasks.
 *
 * @param existingTasks - Array of existing TimeBoxItems
 * @param startAt - Start time of the new task (format: "HH:MM")
 * @param durationMin - Duration in minutes
 * @returns Color index from the TASK_COLORS palette
 */
export function getDistinctColorIndex(
  existingTasks: TimeBoxItem[],
  startAt: string,
  durationMin: number = 30
): number {
  const adjacentColors = findAdjacentColorIndices(existingTasks, startAt, durationMin);

  // If no adjacent tasks, return a random color
  if (adjacentColors.length === 0) {
    return Math.floor(Math.random() * TASK_COLORS.length);
  }

  // Create set of adjacent color indices for quick lookup
  const adjacentColorSet = new Set(adjacentColors);

  // Find available colors (not used by adjacent tasks)
  const availableIndices: number[] = [];
  for (let i = 0; i < TASK_COLORS.length; i++) {
    if (!adjacentColorSet.has(i)) {
      availableIndices.push(i);
    }
  }

  // If we have available colors, pick one randomly
  if (availableIndices.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIndex];
  }

  // Fallback: all colors are taken by adjacent tasks (unlikely with 8 colors)
  // Pick the least recently used or just return the first available
  return Math.floor(Math.random() * TASK_COLORS.length);
}
