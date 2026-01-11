export type TimerStatus = "idle" | "running" | "paused";

export type DisplayMode = "widget" | "fullscreen" | "minimized";

export type BreakMode = "idle" | "focus" | "break";

export type AlarmType = "ALARM_PRESTART" | "ALARM_END" | "ALARM_BREAK_END";

export type SoundType = "preStart" | "focusEnd" | "breakEnd";

export type TimerState = {
  timeboxId: string | null;
  timeboxTitle: string | null;
  status: TimerStatus;
  durationMs: number;
  remainingMs: number;
  elapsedMs: number;
  progress: number;
  isOvertime: boolean;
  startEpoch: number | null;
  pausedMs: number;
  displayMode: DisplayMode;
  // Break mode state
  breakMode: BreakMode;
  breakDurationMs: number;
  breakRemainingMs: number;
  breakProgress: number;
};

export type ScheduledAlarm = {
  id: string;
  type: AlarmType;
  triggerEpoch: number;
  timeboxId: string;
  timeboxTitle: string;
};

export type WorkerCommand =
  | { type: "START"; payload: { id: string; durationMs: number } }
  | { type: "PAUSE"; payload: { id: string } }
  | { type: "RESUME"; payload: { id: string } }
  | { type: "STOP"; payload: { id: string } }
  | {
      type: "RESTORE";
      payload: {
        id: string;
        startEpoch: number;
        pausedMs: number;
        durationMs: number;
        status: "running" | "paused";
      };
    }
  // Alarm scheduling commands
  | { type: "SCHEDULE_ALARM"; payload: ScheduledAlarm }
  | { type: "CANCEL_ALARM"; payload: { id: string } }
  // Break mode commands
  | { type: "START_BREAK"; payload: { id: string; durationMs: number } }
  | { type: "SKIP_BREAK" };

export type TickPayload = {
  id: string;
  remainingMs: number;
  elapsedMs: number;
  progress: number;
  isOvertime: boolean;
};

export type BreakTickPayload = {
  remainingMs: number;
  progress: number;
};

export type AlarmPayload = {
  id: string;
  timeboxId: string;
  timeboxTitle: string;
};

export type WorkerEvent =
  | { type: "TICK"; payload: TickPayload }
  | { type: "TIME_UP"; payload: { id: string } }
  | { type: "STOPPED"; payload: { id: string; elapsedMs: number } }
  // Alarm events
  | { type: "ALARM_PRESTART"; payload: AlarmPayload }
  | { type: "ALARM_END"; payload: AlarmPayload }
  | { type: "ALARM_BREAK_END"; payload: { id: string } }
  // Break mode events
  | { type: "BREAK_TICK"; payload: BreakTickPayload };

export type PersistedTimerState = {
  version: 1;
  timeboxId: string;
  timeboxTitle: string;
  startEpoch: number;
  pausedMs: number;
  durationMs: number;
  status: "running" | "paused";
};

export type BroadcastMessage =
  | { type: "TIMER_STARTED"; payload: PersistedTimerState }
  | { type: "TIMER_PAUSED"; payload: { pausedMs: number } }
  | { type: "TIMER_RESUMED" }
  | { type: "TIMER_STOPPED" }
  | { type: "TIMER_TICK"; payload: TickPayload }
  | { type: "REQUEST_STATE" }
  | { type: "STATE_RESPONSE"; payload: PersistedTimerState | null };
