// Horizontal Timeline Layout Constants

/** Height of each hour row in pixels (reduced for compact view) */
export const HOUR_HEIGHT = 64;

/** Snap granularity in minutes (10-minute intervals) */
export const MINUTE_GRID = 10;

/** Calculate hours to display based on start hour (until 24:00) */
export function getHoursToDisplay(startHour: number): number {
  return 24 - startHour;
}

/** Minimum task duration in minutes */
export const MIN_DURATION = 10;

/** Breakpoint for switching between horizontal (desktop) and vertical (mobile) layout */
export const DESKTOP_BREAKPOINT = 1024;

/** Width of the time label column in pixels */
export const TIME_LABEL_WIDTH = 56;

/** Number of grid columns (6 = 10-minute intervals per hour) */
export const GRID_COLUMNS = 6;

/** Right margin for the timeline area to ensure resize handles are always visible */
export const ROW_RIGHT_PADDING = 16;
