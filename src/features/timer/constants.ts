export const TICK_INTERVAL_MS = 250;
export const PERSISTENCE_KEY = "timebox-timer-state";
export const BROADCAST_CHANNEL_NAME = "timebox-timer-sync";
export const TAB_SYNC_CHANNEL_NAME = "timebox-tab-sync";
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

// Alarm & Break constants
export const PRE_START_MINUTES = 5;
export const PRE_START_MS = PRE_START_MINUTES * 60 * 1000;
export const DEFAULT_BREAK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Break mode colors
export const BREAK_COLORS = {
  ring: "#10B981", // Emerald
  text: "#FFFFFF",
  bg: "bg-emerald-500",
} as const;

// Overtime mode colors
export const OVERTIME_COLORS = {
  ring: "#EF4444", // Red
  text: "#EF4444",
  bg: "bg-red-500",
  pulseAnimation: "animate-pulse",
} as const;

// Sound configuration for Web Audio API synthesized tones
export const SOUND_CONFIG = {
  preStart: {
    frequency: 880, // A5 - high pitch double beep
    type: "sine" as OscillatorType,
    duration: 0.1,
    volume: 0.3,
  },
  focusEnd: {
    notes: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6 major chord arpeggio
    type: "sine" as OscillatorType,
    noteDuration: 0.12,
    volume: 0.4,
  },
  breakEnd: {
    frequencies: [440, 550], // A4/C#5 alternating buzzer
    type: "square" as OscillatorType,
    duration: 0.15,
    volume: 0.2,
  },
} as const;
