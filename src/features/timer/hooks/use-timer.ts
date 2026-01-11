"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useTimerStore } from "../store/timer-store";
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
  AlarmPayload,
  BreakTickPayload,
  DisplayMode,
  PersistedTimerState,
  TickPayload,
} from "../types";

export function useTimer() {
  const { toast } = useToast();
  const hasRestoredRef = useRef(false);

  // Sound unlock hook
  const { unlock: unlockSound } = useSoundUnlock();

  // Get state from store
  const timeboxId = useTimerStore((s) => s.timeboxId);
  const timeboxTitle = useTimerStore((s) => s.timeboxTitle);
  const status = useTimerStore((s) => s.status);
  const durationMs = useTimerStore((s) => s.durationMs);
  const remainingMs = useTimerStore((s) => s.remainingMs);
  const elapsedMs = useTimerStore((s) => s.elapsedMs);
  const progress = useTimerStore((s) => s.progress);
  const isOvertime = useTimerStore((s) => s.isOvertime);
  const startEpoch = useTimerStore((s) => s.startEpoch);
  const pausedMs = useTimerStore((s) => s.pausedMs);
  const displayMode = useTimerStore((s) => s.displayMode);
  const breakMode = useTimerStore((s) => s.breakMode);

  // Get actions from store (these are stable)
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const updateTick = useTimerStore((s) => s.updateTick);
  const storeSetDisplayMode = useTimerStore((s) => s.setDisplayMode);
  const restore = useTimerStore((s) => s.restore);
  // Break mode actions
  const storeStartBreak = useTimerStore((s) => s.startBreak);
  const updateBreakTick = useTimerStore((s) => s.updateBreakTick);
  const endBreak = useTimerStore((s) => s.endBreak);
  const storeSkipBreak = useTimerStore((s) => s.skipBreak);

  const editItem = useDashboardStore((s) => s.editItem);

  const isActive = status !== "idle";
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isBreakMode = breakMode === "break";

  const persistence = useTimerPersistence();

  // Set up notification manager toast fallback
  useEffect(() => {
    getNotificationManager().setToastFn(toast);
  }, [toast]);

  // Worker callbacks - use refs to avoid recreating worker
  const stateRef = useRef({ timeboxId, timeboxTitle, elapsedMs });
  stateRef.current = { timeboxId, timeboxTitle, elapsedMs };

  const handleTick = useCallback((payload: TickPayload) => {
    updateTick(payload);
  }, [updateTick]);

  const handleTimeUp = useCallback(() => {
    // Play focus end sound
    getSoundManager().play("focusEnd");

    // Show notification
    getNotificationManager().showFocusEnd(stateRef.current.timeboxTitle || "Task");

    // Auto-start break mode
    storeStartBreak(DEFAULT_BREAK_DURATION_MS);
  }, [storeStartBreak]);

  // Alarm handlers
  const handleAlarmPreStart = useCallback((payload: AlarmPayload) => {
    getSoundManager().play("preStart");
    getNotificationManager().showPreStart(payload.timeboxTitle);
  }, []);

  const handleAlarmEnd = useCallback((payload: AlarmPayload) => {
    // This is for scheduled end alarms (if used separately from TIME_UP)
    getSoundManager().play("focusEnd");
    getNotificationManager().showFocusEnd(payload.timeboxTitle);
  }, []);

  const handleAlarmBreakEnd = useCallback(() => {
    getSoundManager().play("breakEnd");
    getNotificationManager().showBreakEnd();
    endBreak();
  }, [endBreak]);

  // Break tick handler
  const handleBreakTick = useCallback(
    (payload: BreakTickPayload) => {
      updateBreakTick(payload);
    },
    [updateBreakTick]
  );

  const handleStopped = useCallback(
    (id: string, elapsedMsValue: number) => {
      const actualDurationMin = msToMinutes(elapsedMsValue);

      // Update timebox with actual duration (status stays "ongoing")
      if (stateRef.current.timeboxId) {
        editItem("timeBox", stateRef.current.timeboxId, {
          actualDurationMin,
        } as any);
      }

      stopTimer();
      persistence.clear();

      toast({
        title: "Timer stopped",
        description: `Tracked: ${formatTime(elapsedMsValue, false)}`,
      });
    },
    [editItem, stopTimer, persistence, toast]
  );

  const worker = useTimerWorker({
    onTick: handleTick,
    onTimeUp: handleTimeUp,
    onStopped: handleStopped,
    onAlarmPreStart: handleAlarmPreStart,
    onAlarmEnd: handleAlarmEnd,
    onAlarmBreakEnd: handleAlarmBreakEnd,
    onBreakTick: handleBreakTick,
  });

  // Wake lock for mobile
  useWakeLock(isRunning);

  // Document title sync
  useDocumentTitle({
    enabled: isActive,
    remainingMs,
    isOvertime,
    taskTitle: timeboxTitle,
  });

  // Restore from persistence on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const saved = persistence.load();
    if (saved) {
      restore({
        timeboxId: saved.timeboxId,
        timeboxTitle: saved.timeboxTitle,
        status: saved.status,
        durationMs: saved.durationMs,
        startEpoch: saved.startEpoch,
        pausedMs: saved.pausedMs,
      });

      worker.restore(
        saved.timeboxId,
        saved.startEpoch,
        saved.pausedMs,
        saved.durationMs,
        saved.status
      );

      // Update timebox status to ongoing
      editItem("timeBox", saved.timeboxId, { status: "ongoing" });
    }
  }, []);

  // Save state changes to persistence
  useEffect(() => {
    if (!isActive || !timeboxId || !timeboxTitle || !startEpoch) return;

    const persisted: PersistedTimerState = {
      version: 1,
      timeboxId,
      timeboxTitle,
      startEpoch,
      pausedMs,
      durationMs,
      status: status === "paused" ? "paused" : "running",
    };
    persistence.save(persisted);
  }, [isActive, timeboxId, timeboxTitle, startEpoch, pausedMs, durationMs, status, persistence]);

  // Public actions
  const start = useCallback(
    (id: string, title: string, durationMin: number, scheduledStartEpoch?: number) => {
      // Unlock AudioContext on first interaction
      unlockSound();

      const durationMsValue = minutesToMs(durationMin);

      startTimer(id, title, durationMsValue);
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
    [startTimer, worker, editItem, toast, unlockSound]
  );

  const pause = useCallback(() => {
    if (!timeboxId) return;

    pauseTimer();
    worker.pause(timeboxId);

    toast({
      title: "Timer paused",
      description: timeboxTitle || undefined,
    });
  }, [timeboxId, timeboxTitle, pauseTimer, worker, toast]);

  const resume = useCallback(() => {
    if (!timeboxId) return;

    resumeTimer();
    worker.resume(timeboxId);

    toast({
      title: "Timer resumed",
      description: timeboxTitle || undefined,
    });
  }, [timeboxId, timeboxTitle, resumeTimer, worker, toast]);

  const stop = useCallback(() => {
    if (!timeboxId) return;
    worker.stop(timeboxId);
    // Also cancel any scheduled alarms for this timebox
    worker.cancelAlarm(`prestart-${timeboxId}`);
  }, [timeboxId, worker]);

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => {
      storeSetDisplayMode(mode);
    },
    [storeSetDisplayMode]
  );

  // Skip break and return to idle
  const skipBreak = useCallback(() => {
    worker.skipBreak();
    storeSkipBreak();
  }, [worker, storeSkipBreak]);

  // Start break manually with worker
  const startBreak = useCallback(
    (durationMs: number = DEFAULT_BREAK_DURATION_MS) => {
      storeStartBreak(durationMs);
      worker.startBreak(timeboxId || "break", durationMs);
    },
    [storeStartBreak, worker, timeboxId]
  );

  // Effect to start worker break when store break starts
  useEffect(() => {
    if (isBreakMode && stateRef.current.timeboxId) {
      worker.startBreak(stateRef.current.timeboxId, DEFAULT_BREAK_DURATION_MS);
    }
  }, [isBreakMode, worker]);

  const formattedTime = useMemo(() => {
    return formatTime(remainingMs, isOvertime);
  }, [remainingMs, isOvertime]);

  return {
    // State
    isActive,
    isRunning,
    isPaused,
    isOvertime,
    isBreakMode,
    breakMode,
    status,
    remainingMs,
    elapsedMs,
    progress,
    formattedTime,
    timeboxId,
    timeboxTitle,
    displayMode,
    durationMs,

    // Actions
    start,
    pause,
    resume,
    stop,
    setDisplayMode,
    // Break actions
    startBreak,
    skipBreak,
  };
}
