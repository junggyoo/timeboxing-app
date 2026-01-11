"use client";

import { useCallback, useEffect, useRef } from "react";
import { createTimerWorker } from "../lib/timer-worker";
import type {
  AlarmPayload,
  BreakTickPayload,
  ScheduledAlarm,
  TickPayload,
  WorkerCommand,
  WorkerEvent,
} from "../types";

type UseTimerWorkerOptions = {
  onTick: (payload: TickPayload) => void;
  onTimeUp: (id: string) => void;
  onStopped: (id: string, elapsedMs: number) => void;
  // Alarm callbacks
  onAlarmPreStart?: (payload: AlarmPayload) => void;
  onAlarmEnd?: (payload: AlarmPayload) => void;
  onAlarmBreakEnd?: (id: string) => void;
  // Break callbacks
  onBreakTick?: (payload: BreakTickPayload) => void;
};

export function useTimerWorker({
  onTick,
  onTimeUp,
  onStopped,
  onAlarmPreStart,
  onAlarmEnd,
  onAlarmBreakEnd,
  onBreakTick,
}: UseTimerWorkerOptions) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = createTimerWorker();

    const handleMessage = (e: MessageEvent<WorkerEvent>) => {
      const { type, payload } = e.data;

      switch (type) {
        case "TICK":
          onTick(payload as TickPayload);
          break;
        case "TIME_UP":
          onTimeUp((payload as { id: string }).id);
          break;
        case "STOPPED":
          onStopped(
            (payload as { id: string; elapsedMs: number }).id,
            (payload as { id: string; elapsedMs: number }).elapsedMs
          );
          break;
        // Alarm events
        case "ALARM_PRESTART":
          onAlarmPreStart?.(payload as AlarmPayload);
          break;
        case "ALARM_END":
          onAlarmEnd?.(payload as AlarmPayload);
          break;
        case "ALARM_BREAK_END":
          onAlarmBreakEnd?.((payload as { id: string }).id);
          break;
        // Break events
        case "BREAK_TICK":
          onBreakTick?.(payload as BreakTickPayload);
          break;
      }
    };

    workerRef.current.addEventListener("message", handleMessage);

    return () => {
      if (workerRef.current) {
        workerRef.current.removeEventListener("message", handleMessage);
      }
    };
  }, [onTick, onTimeUp, onStopped, onAlarmPreStart, onAlarmEnd, onAlarmBreakEnd, onBreakTick]);

  const postCommand = useCallback((command: WorkerCommand) => {
    if (workerRef.current) {
      workerRef.current.postMessage(command);
    }
  }, []);

  const start = useCallback(
    (id: string, durationMs: number) => {
      postCommand({ type: "START", payload: { id, durationMs } });
    },
    [postCommand]
  );

  const pause = useCallback(
    (id: string) => {
      postCommand({ type: "PAUSE", payload: { id } });
    },
    [postCommand]
  );

  const resume = useCallback(
    (id: string) => {
      postCommand({ type: "RESUME", payload: { id } });
    },
    [postCommand]
  );

  const stop = useCallback(
    (id: string) => {
      postCommand({ type: "STOP", payload: { id } });
    },
    [postCommand]
  );

  const restore = useCallback(
    (
      id: string,
      startEpoch: number,
      pausedMs: number,
      durationMs: number,
      status: "running" | "paused"
    ) => {
      postCommand({
        type: "RESTORE",
        payload: { id, startEpoch, pausedMs, durationMs, status },
      });
    },
    [postCommand]
  );

  // Alarm scheduling methods
  const scheduleAlarm = useCallback(
    (alarm: ScheduledAlarm) => {
      postCommand({ type: "SCHEDULE_ALARM", payload: alarm });
    },
    [postCommand]
  );

  const cancelAlarm = useCallback(
    (id: string) => {
      postCommand({ type: "CANCEL_ALARM", payload: { id } });
    },
    [postCommand]
  );

  // Break mode methods
  const startBreak = useCallback(
    (id: string, durationMs: number) => {
      postCommand({ type: "START_BREAK", payload: { id, durationMs } });
    },
    [postCommand]
  );

  const skipBreak = useCallback(() => {
    postCommand({ type: "SKIP_BREAK" });
  }, [postCommand]);

  return {
    start,
    pause,
    resume,
    stop,
    restore,
    postCommand,
    // Alarm methods
    scheduleAlarm,
    cancelAlarm,
    // Break methods
    startBreak,
    skipBreak,
  };
}
