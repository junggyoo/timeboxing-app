"use client";

import { useCallback, useEffect, useRef } from "react";
import { createTimerWorker } from "../lib/timer-worker";
import type { TickPayload, WorkerCommand, WorkerEvent } from "../types";

type UseTimerWorkerOptions = {
  onTick: (payload: TickPayload) => void;
  onTimeUp: (id: string) => void;
  onStopped: (id: string, elapsedMs: number) => void;
};

export function useTimerWorker({ onTick, onTimeUp, onStopped }: UseTimerWorkerOptions) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = createTimerWorker();

    const handleMessage = (e: MessageEvent<WorkerEvent>) => {
      const { type, payload } = e.data;

      switch (type) {
        case "TICK":
          onTick(payload);
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
      }
    };

    workerRef.current.addEventListener("message", handleMessage);

    return () => {
      if (workerRef.current) {
        workerRef.current.removeEventListener("message", handleMessage);
      }
    };
  }, [onTick, onTimeUp, onStopped]);

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

  return { start, pause, resume, stop, restore, postCommand };
}
