import type { BreakTickPayload, TickPayload } from "../types";

/**
 * FSM States for the Timebox Timer
 *
 * State flow:
 * idle → focus_running ↔ focus_paused
 *            ↓ (TIME_UP)
 *      overtime_running
 *            ↓ (FINISH_AND_BREAK)
 *      break_ready → (skip) → idle
 *            ↓ (START_BREAK)
 *      break_running
 *            ↓ (BREAK_COMPLETED)
 *      break_completed → (DISMISS) → idle
 */
export type FsmState =
  | "idle" // No timer active, ready to start
  | "focus_running" // Counting down focus time
  | "focus_paused" // User manually paused
  | "overtime_running" // Time exhausted, counting UP (shows +MM:SS in red)
  | "break_ready" // Modal prompt to start break
  | "break_running" // Break timer counting down
  | "break_completed"; // Break done, waiting for dismiss

/**
 * FSM Events that trigger state transitions
 */
export type FsmEvent =
  | {
      type: "START";
      payload: { timeboxId: string; title: string; durationMs: number };
    }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "TICK"; payload: TickPayload }
  | { type: "TIME_UP" } // Fired when remainingMs <= 0
  | { type: "FINISH_AND_BREAK" } // User clicks "Finish & Break" in overtime
  | { type: "START_BREAK" } // User confirms break in break_ready modal
  | { type: "SKIP_BREAK" } // User skips break
  | { type: "BREAK_TICK"; payload: BreakTickPayload }
  | { type: "BREAK_COMPLETED" } // Break timer exhausted
  | { type: "DISMISS_BREAK" }; // User dismisses break_completed

/**
 * FSM Context - data associated with the current state
 */
export type FsmContext = {
  timeboxId: string | null;
  timeboxTitle: string | null;
  durationMs: number;
  remainingMs: number;
  elapsedMs: number;
  overtimeMs: number; // Tracks how long user has been in overtime
  breakDurationMs: number;
  breakRemainingMs: number;
  startEpoch: number | null;
  pausedMs: number;
  hasPlayedTimeUpSound: boolean; // Prevents re-playing sound on re-render
};

/**
 * Result of a state transition including side effects
 */
export type TransitionResult = {
  nextState: FsmState;
  nextContext: FsmContext;
  sideEffects: Array<() => void>;
};

/**
 * FSM Store type combining state, context, and actions
 */
export type FsmStore = {
  state: FsmState;
  context: FsmContext;
  dispatch: (event: FsmEvent) => void;
  reset: () => void;
};
