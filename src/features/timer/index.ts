// Types
export type {
  TimerStatus,
  DisplayMode,
  BreakMode,
  AlarmType,
  SoundType,
  TimerState,
  ScheduledAlarm,
  WorkerCommand,
  WorkerEvent,
  TickPayload,
  BreakTickPayload,
  AlarmPayload,
  PersistedTimerState,
  BroadcastMessage,
  // FSM types
  FsmState,
  FsmEvent,
  FsmContext,
  FsmStore,
  TransitionResult,
} from "./types";

// Constants
export {
  TICK_INTERVAL_MS,
  PERSISTENCE_KEY,
  BROADCAST_CHANNEL_NAME,
  TAB_SYNC_CHANNEL_NAME,
  WIDGET_POSITION_KEY,
  TIMER_COLORS,
  BREAK_COLORS,
  OVERTIME_COLORS,
  DEFAULT_WIDGET_POSITION,
  WIDGET_SIZE,
  MOBILE_BAR_HEIGHT,
  PRE_START_MINUTES,
  PRE_START_MS,
  DEFAULT_BREAK_DURATION_MS,
  SOUND_CONFIG,
} from "./constants";

// Store
export {
  useTimerStore,
  selectIsActive,
  selectIsRunning,
  selectIsPaused,
  selectIsBreakMode,
  selectIsFocusMode,
} from "./store/timer-store";

export { useTabStore, selectIsActiveTab, selectTabId } from "./store/tab-store";

export { useFsmStore } from "./hooks/use-timebox-fsm";

// Hooks
export { useTimer } from "./hooks/use-timer";
export { useTimeboxFsm } from "./hooks/use-timebox-fsm";
export { useSingleTabEnforcement } from "./hooks/use-single-tab-enforcement";
export {
  useNextTaskSuggestion,
  usePendingTasks,
  type SuggestedTask,
  type SuggestionReason,
} from "./hooks/use-next-task-suggestion";
export { useTimerWorker } from "./hooks/use-timer-worker";
export { useTimerPersistence } from "./hooks/use-timer-persistence";
export { useTimerSync } from "./hooks/use-timer-sync";
export { useWakeLock } from "./hooks/use-wake-lock";
export { useDocumentTitle } from "./hooks/use-document-title";
export { useSoundUnlock } from "./hooks/use-sound-unlock";
export { useNotificationPermission } from "./hooks/use-notification-permission";
export { useBreakMode } from "./hooks/use-break-mode";

// Utilities
export { formatTime, formatDuration, minutesToMs, msToMinutes } from "./lib/format-time";
export { getSoundManager, SoundManager } from "./lib/sound-manager";
export { getNotificationManager, NotificationManager } from "./lib/notification-manager";

// Components
export { TimerProgressRing } from "./components/timer-progress-ring";
export { TimerDisplay } from "./components/timer-display";
export { TimerControls } from "./components/timer-controls";
export { TimerWidget } from "./components/timer-widget";
export { TimerFullscreen } from "./components/timer-fullscreen";
export { TimerMobileBar } from "./components/timer-mobile-bar";
export { TimerProvider, useTimerActions } from "./components/timer-provider";
export { BreakCountdown } from "./components/break-countdown";
export { BreakReadyModal } from "./components/break-ready-modal";
export { TabInactiveOverlay } from "./components/tab-inactive-overlay";
export { SoundTest } from "./components/sound-test";
