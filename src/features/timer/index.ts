// Types
export type {
  TimerStatus,
  DisplayMode,
  TimerState,
  WorkerCommand,
  WorkerEvent,
  TickPayload,
  PersistedTimerState,
  BroadcastMessage,
} from "./types";

// Constants
export {
  TICK_INTERVAL_MS,
  PERSISTENCE_KEY,
  BROADCAST_CHANNEL_NAME,
  WIDGET_POSITION_KEY,
  TIMER_COLORS,
  DEFAULT_WIDGET_POSITION,
  WIDGET_SIZE,
  MOBILE_BAR_HEIGHT,
} from "./constants";

// Store
export { useTimerStore, selectIsActive, selectIsRunning, selectIsPaused } from "./store/timer-store";

// Hooks
export { useTimer } from "./hooks/use-timer";
export { useTimerWorker } from "./hooks/use-timer-worker";
export { useTimerPersistence } from "./hooks/use-timer-persistence";
export { useTimerSync } from "./hooks/use-timer-sync";
export { useWakeLock } from "./hooks/use-wake-lock";
export { useDocumentTitle } from "./hooks/use-document-title";

// Utilities
export { formatTime, formatDuration, minutesToMs, msToMinutes } from "./lib/format-time";

// Components
export { TimerProgressRing } from "./components/timer-progress-ring";
export { TimerDisplay } from "./components/timer-display";
export { TimerControls } from "./components/timer-controls";
export { TimerWidget } from "./components/timer-widget";
export { TimerFullscreen } from "./components/timer-fullscreen";
export { TimerMobileBar } from "./components/timer-mobile-bar";
export { TimerProvider, useTimerActions } from "./components/timer-provider";
