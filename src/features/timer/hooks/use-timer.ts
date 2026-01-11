"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useTimerStore } from "../store/timer-store";
import { useTimerWorker } from "./use-timer-worker";
import { useTimerPersistence } from "./use-timer-persistence";
import { useWakeLock } from "./use-wake-lock";
import { useDocumentTitle } from "./use-document-title";
import { formatTime, minutesToMs, msToMinutes } from "../lib/format-time";
import type { DisplayMode, PersistedTimerState, TickPayload } from "../types";

export function useTimer() {
  const { toast } = useToast();
  const hasRestoredRef = useRef(false);

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

  // Get actions from store (these are stable)
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const updateTick = useTimerStore((s) => s.updateTick);
  const storeSetDisplayMode = useTimerStore((s) => s.setDisplayMode);
  const restore = useTimerStore((s) => s.restore);

  const editItem = useDashboardStore((s) => s.editItem);

  const isActive = status !== "idle";
  const isRunning = status === "running";
  const isPaused = status === "paused";

  const persistence = useTimerPersistence();

  // Worker callbacks - use refs to avoid recreating worker
  const stateRef = useRef({ timeboxId, elapsedMs });
  stateRef.current = { timeboxId, elapsedMs };

  const handleTick = useCallback((payload: TickPayload) => {
    updateTick(payload);
  }, [updateTick]);

  const handleTimeUp = useCallback(() => {
    toast({
      title: "Time's up!",
      description: "Overtime mode started. Keep going or stop when ready.",
      variant: "destructive",
    });
  }, [toast]);

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
    (id: string, title: string, durationMin: number) => {
      const durationMsValue = minutesToMs(durationMin);

      startTimer(id, title, durationMsValue);
      worker.start(id, durationMsValue);

      // Update timebox status to ongoing
      editItem("timeBox", id, { status: "ongoing" });

      toast({
        title: "Timer started",
        description: `Focus on: ${title}`,
      });
    },
    [startTimer, worker, editItem, toast]
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
  }, [timeboxId, worker]);

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => {
      storeSetDisplayMode(mode);
    },
    [storeSetDisplayMode]
  );

  const formattedTime = useMemo(() => {
    return formatTime(remainingMs, isOvertime);
  }, [remainingMs, isOvertime]);

  return {
    // State
    isActive,
    isRunning,
    isPaused,
    isOvertime,
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
  };
}
