export const TICK_INTERVAL_MS = 250;
export const PERSISTENCE_KEY = "timebox-timer-state";
export const BROADCAST_CHANNEL_NAME = "timebox-timer-sync";
export const WIDGET_POSITION_KEY = "timebox-timer-widget-position";

export const TIMER_COLORS = {
  normal: {
    ring: "#2563EB",
    text: "#1E2A38",
    bg: "bg-blue-500",
  },
  overtime: {
    ring: "#EF4444",
    text: "#EF4444",
    bg: "bg-red-500",
  },
  paused: {
    ring: "#F59E0B",
    text: "#F59E0B",
    bg: "bg-amber-500",
  },
} as const;

export const DEFAULT_WIDGET_POSITION = {
  x: 20,
  y: 20,
} as const;

export const WIDGET_SIZE = {
  width: 280,
  height: 160,
} as const;

export const MOBILE_BAR_HEIGHT = 72;
