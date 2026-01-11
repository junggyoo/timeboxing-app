/**
 * Format milliseconds to MM:SS or +MM:SS (for overtime)
 */
export function formatTime(ms: number, isOvertime: boolean = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return isOvertime ? `+${formatted}` : formatted;
}

/**
 * Format milliseconds to human-readable duration (e.g., "5m 30s")
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

/**
 * Convert minutes to milliseconds
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/**
 * Convert milliseconds to minutes (rounded)
 */
export function msToMinutes(ms: number): number {
  return Math.round(ms / 1000 / 60);
}
