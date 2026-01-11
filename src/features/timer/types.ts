export type TimerStatus = "idle" | "running" | "paused";

export type DisplayMode = "widget" | "fullscreen" | "minimized";

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
    };

export type TickPayload = {
  id: string;
  remainingMs: number;
  elapsedMs: number;
  progress: number;
  isOvertime: boolean;
};

export type WorkerEvent =
  | { type: "TICK"; payload: TickPayload }
  | { type: "TIME_UP"; payload: { id: string } }
  | { type: "STOPPED"; payload: { id: string; elapsedMs: number } };

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
