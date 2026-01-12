"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { create } from "zustand";
import { match, P } from "ts-pattern";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useTimerWorker } from "./use-timer-worker";
import { useTimerPersistence } from "./use-timer-persistence";
import { useWakeLock } from "./use-wake-lock";
import { useDocumentTitle } from "./use-document-title";
import { useSoundUnlock } from "./use-sound-unlock";
import { formatTime, minutesToMs, msToMinutes } from "../lib/format-time";
import { getSoundManager } from "../lib/sound-manager";
import { getNotificationManager } from "../lib/notification-manager";
import { DEFAULT_BREAK_DURATION_MS, PRE_START_MS } from "../constants";
import type {
  FsmState,
  FsmEvent,
  FsmContext,
  FsmStore,
  TransitionResult,
} from "../types/fsm-types";
import type {
  BreakTickPayload,
  DisplayMode,
  PersistedTimerState,
  TickPayload,
} from "../types";

// Initial context values
const initialContext: FsmContext = {
  timeboxId: null,
  timeboxTitle: null,
  durationMs: 0,
  remainingMs: 0,
  elapsedMs: 0,
  overtimeMs: 0,
  breakDurationMs: DEFAULT_BREAK_DURATION_MS,
  breakRemainingMs: 0,
  startEpoch: null,
  pausedMs: 0,
  hasPlayedTimeUpSound: false,
};

/**
 * Pure transition function - determines next state and side effects
 * based on current state and incoming event
 */
function transition(
  state: FsmState,
  context: FsmContext,
  event: FsmEvent
): TransitionResult {
  const sideEffects: Array<() => void> = [];

  const result = match<[FsmState, FsmEvent], TransitionResult>([state, event])
    // ===== IDLE STATE =====
    // idle → focus_running (START)
    .with(["idle", { type: "START", payload: P.select() }], (payload) => ({
      nextState: "focus_running" as FsmState,
      nextContext: {
        ...initialContext,
        timeboxId: payload.timeboxId,
        timeboxTitle: payload.title,
        durationMs: payload.durationMs,
        remainingMs: payload.durationMs,
        elapsedMs: 0,
        overtimeMs: 0,
        startEpoch: Date.now(),
        hasPlayedTimeUpSound: false,
      },
      sideEffects,
    }))

    // ===== FOCUS_RUNNING STATE =====
    // focus_running: TICK event
    .with(
      ["focus_running", { type: "TICK", payload: P.select() }],
      (payload) => ({
        nextState: "focus_running" as FsmState,
        nextContext: {
          ...context,
          remainingMs: payload.remainingMs,
          elapsedMs: payload.elapsedMs,
        },
        sideEffects,
      })
    )

    // focus_running → focus_paused (PAUSE)
    .with(["focus_running", { type: "PAUSE" }], () => ({
      nextState: "focus_paused" as FsmState,
      nextContext: context,
      sideEffects,
    }))

    // focus_running → overtime_running (TIME_UP)
    .with(["focus_running", { type: "TIME_UP" }], () => {
      if (!context.hasPlayedTimeUpSound) {
        sideEffects.push(() => {
          getSoundManager().play("focusEnd");
          getNotificationManager().showFocusEnd(
            context.timeboxTitle || "Task"
          );
        });
      }
      return {
        nextState: "overtime_running" as FsmState,
        nextContext: {
          ...context,
          remainingMs: 0,
          hasPlayedTimeUpSound: true,
        },
        sideEffects,
      };
    })

    // focus_running → idle (STOP)
    .with(["focus_running", { type: "STOP" }], () => ({
      nextState: "idle" as FsmState,
      nextContext: initialContext,
      sideEffects,
    }))

    // ===== FOCUS_PAUSED STATE =====
    // focus_paused → focus_running (RESUME)
    .with(["focus_paused", { type: "RESUME" }], () => ({
      nextState: "focus_running" as FsmState,
      nextContext: context,
      sideEffects,
    }))

    // focus_paused → idle (STOP)
    .with(["focus_paused", { type: "STOP" }], () => ({
      nextState: "idle" as FsmState,
      nextContext: initialContext,
      sideEffects,
    }))

    // ===== OVERTIME_RUNNING STATE =====
    // overtime_running: TICK event (counting UP)
    .with(
      ["overtime_running", { type: "TICK", payload: P.select() }],
      (payload) => ({
        nextState: "overtime_running" as FsmState,
        nextContext: {
          ...context,
          elapsedMs: payload.elapsedMs,
          overtimeMs: Math.max(0, payload.elapsedMs - context.durationMs),
        },
        sideEffects,
      })
    )

    // overtime_running → break_ready (FINISH_AND_BREAK)
    .with(["overtime_running", { type: "FINISH_AND_BREAK" }], () => ({
      nextState: "break_ready" as FsmState,
      nextContext: context,
      sideEffects,
    }))

    // overtime_running → idle (STOP)
    .with(["overtime_running", { type: "STOP" }], () => ({
      nextState: "idle" as FsmState,
      nextContext: initialContext,
      sideEffects,
    }))

    // ===== BREAK_READY STATE =====
    // break_ready → break_running (START_BREAK)
    .with(["break_ready", { type: "START_BREAK" }], () => ({
      nextState: "break_running" as FsmState,
      nextContext: {
        ...context,
        breakRemainingMs: context.breakDurationMs,
      },
      sideEffects,
    }))

    // break_ready → idle (SKIP_BREAK)
    .with(["break_ready", { type: "SKIP_BREAK" }], () => ({
      nextState: "idle" as FsmState,
      nextContext: initialContext,
      sideEffects,
    }))

    // ===== BREAK_RUNNING STATE =====
    // break_running: BREAK_TICK event
    .with(
      ["break_running", { type: "BREAK_TICK", payload: P.select() }],
      (payload) => ({
        nextState: "break_running" as FsmState,
        nextContext: {
          ...context,
          breakRemainingMs: payload.remainingMs,
        },
        sideEffects,
      })
    )

    // break_running → break_completed (BREAK_COMPLETED)
    .with(["break_running", { type: "BREAK_COMPLETED" }], () => {
      sideEffects.push(() => {
        getSoundManager().play("breakEnd");
        getNotificationManager().showBreakEnd();
      });
      return {
        nextState: "break_completed" as FsmState,
        nextContext: context,
        sideEffects,
      };
    })

    // break_running → idle (SKIP_BREAK)
    .with(["break_running", { type: "SKIP_BREAK" }], () => ({
      nextState: "idle" as FsmState,
      nextContext: initialContext,
      sideEffects,
    }))

    // ===== BREAK_COMPLETED STATE =====
    // break_completed → idle (DISMISS_BREAK)
    .with(["break_completed", { type: "DISMISS_BREAK" }], () => ({
      nextState: "idle" as FsmState,
      nextContext: initialContext,
      sideEffects,
    }))

    // ===== DEFAULT: No transition =====
    .otherwise(() => ({
      nextState: state,
      nextContext: context,
      sideEffects,
    }));

  return result;
}

/**
 * FSM Store using Zustand
 */
export const useFsmStore = create<
  FsmStore & {
    displayMode: DisplayMode;
    setDisplayMode: (mode: DisplayMode) => void;
  }
>((set, get) => ({
  state: "idle",
  context: initialContext,
  displayMode: "widget",

  dispatch: (event: FsmEvent) => {
    const { state, context } = get();
    const { nextState, nextContext, sideEffects } = transition(
      state,
      context,
      event
    );

    set({ state: nextState, context: nextContext });

    // Execute side effects after state update
    sideEffects.forEach((effect) => effect());
  },

  reset: () => set({ state: "idle", context: initialContext }),

  setDisplayMode: (mode: DisplayMode) => set({ displayMode: mode }),
}));

/**
 * Main FSM Hook - orchestrates FSM with worker and provides public API
 */
export function useTimeboxFsm() {
  const { toast } = useToast();
  const hasRestoredRef = useRef(false);

  // Sound unlock hook
  const { unlock: unlockSound } = useSoundUnlock();

  // Get state from FSM store
  const state = useFsmStore((s) => s.state);
  const context = useFsmStore((s) => s.context);
  const dispatch = useFsmStore((s) => s.dispatch);
  const displayMode = useFsmStore((s) => s.displayMode);
  const setDisplayModeStore = useFsmStore((s) => s.setDisplayMode);

  // Dashboard store for updating timebox status
  const editItem = useDashboardStore((s) => s.editItem);

  // Persistence
  const persistence = useTimerPersistence();

  // Derived states
  const isIdle = state === "idle";
  const isFocusRunning = state === "focus_running";
  const isFocusPaused = state === "focus_paused";
  const isOvertimeRunning = state === "overtime_running";
  const isBreakReady = state === "break_ready";
  const isBreakRunning = state === "break_running";
  const isBreakCompleted = state === "break_completed";
  const isActive = !isIdle;
  const isRunning = isFocusRunning || isOvertimeRunning;
  const isPaused = isFocusPaused;
  const isBreakMode = isBreakRunning || isBreakCompleted;

  // Set up notification manager toast fallback
  useEffect(() => {
    getNotificationManager().setToastFn(toast);
  }, [toast]);

  // Ref for callbacks to avoid recreating worker
  const stateRef = useRef({ state, context });
  stateRef.current = { state, context };

  // Worker callbacks
  const handleTick = useCallback(
    (payload: TickPayload) => {
      const currentState = stateRef.current.state;

      // Dispatch tick event
      dispatch({ type: "TICK", payload });

      // Check for TIME_UP transition (only from focus_running)
      if (payload.isOvertime && currentState === "focus_running") {
        dispatch({ type: "TIME_UP" });
      }
    },
    [dispatch]
  );

  const handleBreakTick = useCallback(
    (payload: BreakTickPayload) => {
      dispatch({ type: "BREAK_TICK", payload });

      // Check for break completion
      if (payload.remainingMs <= 0) {
        dispatch({ type: "BREAK_COMPLETED" });
      }
    },
    [dispatch]
  );

  const handleTimeUp = useCallback(() => {
    // The TIME_UP is handled in handleTick based on isOvertime flag
    // This callback is for direct worker TIME_UP events if needed
  }, []);

  const handleStopped = useCallback(
    (id: string, elapsedMsValue: number) => {
      const actualDurationMin = msToMinutes(elapsedMsValue);
      const currentContext = stateRef.current.context;

      // Update timebox with actual duration
      if (currentContext.timeboxId) {
        editItem("timeBox", currentContext.timeboxId, {
          actualDurationMin,
        } as Parameters<typeof editItem>[2]);
      }

      persistence.clear();

      toast({
        title: "Timer stopped",
        description: `Tracked: ${formatTime(elapsedMsValue, false)}`,
      });
    },
    [editItem, persistence, toast]
  );

  const handleAlarmBreakEnd = useCallback(() => {
    dispatch({ type: "BREAK_COMPLETED" });
  }, [dispatch]);

  // Create worker
  const worker = useTimerWorker({
    onTick: handleTick,
    onTimeUp: handleTimeUp,
    onStopped: handleStopped,
    onBreakTick: handleBreakTick,
    onAlarmBreakEnd: handleAlarmBreakEnd,
    onAlarmPreStart: () => {},
    onAlarmEnd: () => {},
  });

  // Wake lock for mobile
  useWakeLock(isRunning);

  // Document title sync
  useDocumentTitle({
    enabled: isActive,
    remainingMs: isOvertimeRunning ? -context.overtimeMs : context.remainingMs,
    isOvertime: isOvertimeRunning,
    taskTitle: context.timeboxTitle,
  });

  // Restore from persistence on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const saved = persistence.load();
    if (saved) {
      // Dispatch START to restore state
      dispatch({
        type: "START",
        payload: {
          timeboxId: saved.timeboxId,
          title: saved.timeboxTitle,
          durationMs: saved.durationMs,
        },
      });

      // If it was paused, dispatch PAUSE
      if (saved.status === "paused") {
        dispatch({ type: "PAUSE" });
      }

      // Restore worker state
      worker.restore(
        saved.timeboxId,
        saved.startEpoch,
        saved.pausedMs,
        saved.durationMs,
        saved.status
      );

      // Update timebox status
      editItem("timeBox", saved.timeboxId, { status: "ongoing" });
    }
  }, []);

  // Save state changes to persistence
  useEffect(() => {
    if (
      !isActive ||
      !context.timeboxId ||
      !context.timeboxTitle ||
      !context.startEpoch
    )
      return;

    const persisted: PersistedTimerState = {
      version: 1,
      timeboxId: context.timeboxId,
      timeboxTitle: context.timeboxTitle,
      startEpoch: context.startEpoch,
      pausedMs: context.pausedMs,
      durationMs: context.durationMs,
      status: isPaused ? "paused" : "running",
    };
    persistence.save(persisted);
  }, [isActive, context, isPaused, persistence]);

  // ===== PUBLIC ACTIONS =====

  const start = useCallback(
    (
      id: string,
      title: string,
      durationMin: number,
      scheduledStartEpoch?: number
    ) => {
      // Unlock AudioContext on first interaction
      unlockSound();

      const durationMsValue = minutesToMs(durationMin);

      // Dispatch FSM event
      dispatch({
        type: "START",
        payload: { timeboxId: id, title, durationMs: durationMsValue },
      });

      // Start worker
      worker.start(id, durationMsValue);

      // Schedule pre-start alarm if task is in the future
      const now = Date.now();
      if (scheduledStartEpoch && scheduledStartEpoch > now + PRE_START_MS) {
        worker.scheduleAlarm({
          id: `prestart-${id}`,
          type: "ALARM_PRESTART",
          triggerEpoch: scheduledStartEpoch - PRE_START_MS,
          timeboxId: id,
          timeboxTitle: title,
        });
      }

      // Update timebox status to ongoing
      editItem("timeBox", id, { status: "ongoing" });

      toast({
        title: "Timer started",
        description: `Focus on: ${title}`,
      });
    },
    [dispatch, worker, editItem, toast, unlockSound]
  );

  const pause = useCallback(() => {
    if (!context.timeboxId) return;

    dispatch({ type: "PAUSE" });
    worker.pause(context.timeboxId);

    toast({
      title: "Timer paused",
      description: context.timeboxTitle || undefined,
    });
  }, [dispatch, worker, context.timeboxId, context.timeboxTitle, toast]);

  const resume = useCallback(() => {
    if (!context.timeboxId) return;

    dispatch({ type: "RESUME" });
    worker.resume(context.timeboxId);

    toast({
      title: "Timer resumed",
      description: context.timeboxTitle || undefined,
    });
  }, [dispatch, worker, context.timeboxId, context.timeboxTitle, toast]);

  const stop = useCallback(() => {
    if (!context.timeboxId) return;

    dispatch({ type: "STOP" });
    worker.stop(context.timeboxId);
    worker.cancelAlarm(`prestart-${context.timeboxId}`);
    persistence.clear();
  }, [dispatch, worker, context.timeboxId, persistence]);

  const finishAndBreak = useCallback(() => {
    if (!context.timeboxId) return;

    // Stop the focus timer in worker
    worker.stop(context.timeboxId);

    // Record actual duration
    const actualDurationMin = msToMinutes(context.elapsedMs);
    editItem("timeBox", context.timeboxId, {
      actualDurationMin,
      status: "done",
    } as Parameters<typeof editItem>[2]);

    // Transition to break_ready
    dispatch({ type: "FINISH_AND_BREAK" });

    toast({
      title: "Focus complete!",
      description: `Great work on "${context.timeboxTitle}"`,
    });
  }, [dispatch, worker, context, editItem, toast]);

  const startBreak = useCallback(() => {
    dispatch({ type: "START_BREAK" });
    worker.startBreak(
      context.timeboxId || "break",
      context.breakDurationMs
    );
    // Show break countdown in fullscreen mode
    setDisplayModeStore("fullscreen");
  }, [dispatch, worker, context.timeboxId, context.breakDurationMs, setDisplayModeStore]);

  const skipBreak = useCallback(() => {
    dispatch({ type: "SKIP_BREAK" });
    worker.skipBreak();
    persistence.clear();
  }, [dispatch, worker, persistence]);

  const dismissBreak = useCallback(() => {
    dispatch({ type: "DISMISS_BREAK" });
    persistence.clear();
  }, [dispatch, persistence]);

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => {
      setDisplayModeStore(mode);
    },
    [setDisplayModeStore]
  );

  // Formatted display values
  const formattedTime = useMemo(() => {
    if (isOvertimeRunning) {
      // Show +MM:SS format for overtime
      return formatTime(context.overtimeMs, true);
    }
    if (isBreakRunning || isBreakCompleted) {
      return formatTime(context.breakRemainingMs, false);
    }
    return formatTime(context.remainingMs, false);
  }, [
    isOvertimeRunning,
    isBreakRunning,
    isBreakCompleted,
    context.overtimeMs,
    context.remainingMs,
    context.breakRemainingMs,
  ]);

  const progress = useMemo(() => {
    if (isBreakRunning) {
      return context.breakDurationMs > 0
        ? 1 -
            context.breakRemainingMs / context.breakDurationMs
        : 0;
    }
    return context.durationMs > 0
      ? Math.min(1, context.elapsedMs / context.durationMs)
      : 0;
  }, [
    isBreakRunning,
    context.elapsedMs,
    context.durationMs,
    context.breakRemainingMs,
    context.breakDurationMs,
  ]);

  return {
    // FSM State
    state,
    isIdle,
    isFocusRunning,
    isFocusPaused,
    isOvertimeRunning,
    isBreakReady,
    isBreakRunning,
    isBreakCompleted,

    // Derived states (for compatibility with existing components)
    isActive,
    isRunning,
    isPaused,
    isOvertime: isOvertimeRunning,
    isBreakMode,
    status: (isIdle
      ? "idle"
      : isPaused
        ? "paused"
        : "running") as "idle" | "running" | "paused",
    breakMode: (isBreakRunning || isBreakCompleted
      ? "break"
      : isActive
        ? "focus"
        : "idle") as "idle" | "focus" | "break",

    // Context values
    timeboxId: context.timeboxId,
    timeboxTitle: context.timeboxTitle,
    remainingMs: context.remainingMs,
    elapsedMs: context.elapsedMs,
    overtimeMs: context.overtimeMs,
    breakRemainingMs: context.breakRemainingMs,
    durationMs: context.durationMs,
    formattedTime,
    progress,
    displayMode,

    // Actions
    start,
    pause,
    resume,
    stop,
    finishAndBreak,
    startBreak,
    skipBreak,
    dismissBreak,
    setDisplayMode,
  };
}
