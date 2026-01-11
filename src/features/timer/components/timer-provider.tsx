"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useTimerStore } from "../store/timer-store";
import { createTimerWorker } from "../lib/timer-worker";
import { useTimerPersistence } from "../hooks/use-timer-persistence";
import { useWakeLock } from "../hooks/use-wake-lock";
import { useDocumentTitle } from "../hooks/use-document-title";
import { formatTime, minutesToMs, msToMinutes } from "../lib/format-time";
import type { PersistedTimerState, TickPayload, WorkerEvent } from "../types";

type TimerContextValue = {
  start: (timeboxId: string, timeboxTitle: string, durationMin: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimerActions() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerActions must be used within TimerProvider");
  }
  return context;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const workerRef = useRef<Worker | null>(null);
  const hasRestoredRef = useRef(false);

  // Store state
  const timeboxId = useTimerStore((s) => s.timeboxId);
  const timeboxTitle = useTimerStore((s) => s.timeboxTitle);
  const status = useTimerStore((s) => s.status);
  const durationMs = useTimerStore((s) => s.durationMs);
  const remainingMs = useTimerStore((s) => s.remainingMs);
  const isOvertime = useTimerStore((s) => s.isOvertime);
  const startEpoch = useTimerStore((s) => s.startEpoch);
  const pausedMs = useTimerStore((s) => s.pausedMs);

  // Store actions
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const updateTick = useTimerStore((s) => s.updateTick);
  const restore = useTimerStore((s) => s.restore);

  // Dashboard store - watch for timebox deletion
  const { editItem, timeBoxIds } = useDashboardStore(
    useShallow((s) => ({
      editItem: s.editItem,
      timeBoxIds: new Set(s.timeBox.map((item) => item.id)),
    }))
  );
  const persistence = useTimerPersistence();

  const isActive = status !== "idle";
  const isRunning = status === "running";

  // Refs for callbacks
  const stateRef = useRef({ timeboxId, timeboxTitle });
  stateRef.current = { timeboxId, timeboxTitle };

  // Wake lock
  useWakeLock(isRunning);

  // Document title
  useDocumentTitle({
    enabled: isActive,
    remainingMs,
    isOvertime,
    taskTitle: timeboxTitle,
  });

  // Initialize worker and set up message handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    workerRef.current = createTimerWorker();

    const handleMessage = (e: MessageEvent<WorkerEvent>) => {
      const { type, payload } = e.data;

      switch (type) {
        case "TICK":
          updateTick(payload as TickPayload);
          break;
        case "TIME_UP":
          toast({
            title: "Time's up!",
            description: "Overtime mode started. Keep going or stop when ready.",
            variant: "destructive",
          });
          break;
        case "STOPPED": {
          const { elapsedMs } = payload as { id: string; elapsedMs: number };
          const actualDurationMin = msToMinutes(elapsedMs);

          if (stateRef.current.timeboxId) {
            editItem("timeBox", stateRef.current.timeboxId, {
              actualDurationMin,
            } as any);
          }

          stopTimer();
          persistence.clear();

          toast({
            title: "Timer stopped",
            description: `Tracked: ${formatTime(elapsedMs, false)}`,
          });
          break;
        }
      }
    };

    workerRef.current.addEventListener("message", handleMessage);

    return () => {
      workerRef.current?.removeEventListener("message", handleMessage);
    };
  }, [updateTick, stopTimer, editItem, persistence, toast]);

  // Restore from persistence on mount
  useEffect(() => {
    if (hasRestoredRef.current || !workerRef.current) return;
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

      workerRef.current.postMessage({
        type: "RESTORE",
        payload: {
          id: saved.timeboxId,
          startEpoch: saved.startEpoch,
          pausedMs: saved.pausedMs,
          durationMs: saved.durationMs,
          status: saved.status,
        },
      });

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

  // Watch for timebox deletion - stop timer if the active timebox is deleted
  useEffect(() => {
    if (!isActive || !timeboxId) return;

    // If the current timebox is no longer in the list, stop the timer
    if (!timeBoxIds.has(timeboxId)) {
      workerRef.current?.postMessage({ type: "STOP", payload: { id: timeboxId } });

      toast({
        title: "Timer stopped",
        description: "The timebox was deleted.",
        variant: "destructive",
      });
    }
  }, [isActive, timeboxId, timeBoxIds, toast]);

  // Actions
  const start = useCallback(
    (id: string, title: string, durationMin: number) => {
      const durationMsValue = minutesToMs(durationMin);

      startTimer(id, title, durationMsValue);

      workerRef.current?.postMessage({
        type: "START",
        payload: { id, durationMs: durationMsValue },
      });

      editItem("timeBox", id, { status: "ongoing" });

      toast({
        title: "Timer started",
        description: `Focus on: ${title}`,
      });
    },
    [startTimer, editItem, toast]
  );

  const pause = useCallback(() => {
    const id = stateRef.current.timeboxId;
    if (!id) return;

    pauseTimer();
    workerRef.current?.postMessage({ type: "PAUSE", payload: { id } });

    toast({
      title: "Timer paused",
      description: stateRef.current.timeboxTitle || undefined,
    });
  }, [pauseTimer, toast]);

  const resume = useCallback(() => {
    const id = stateRef.current.timeboxId;
    if (!id) return;

    resumeTimer();
    workerRef.current?.postMessage({ type: "RESUME", payload: { id } });

    toast({
      title: "Timer resumed",
      description: stateRef.current.timeboxTitle || undefined,
    });
  }, [resumeTimer, toast]);

  const stop = useCallback(() => {
    const id = stateRef.current.timeboxId;
    if (!id) return;

    workerRef.current?.postMessage({ type: "STOP", payload: { id } });
  }, []);

  const value: TimerContextValue = {
    start,
    pause,
    resume,
    stop,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
