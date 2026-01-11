"use client";

import { create } from "zustand";
import type { DisplayMode, TickPayload, TimerState, TimerStatus } from "../types";

type TimerActions = {
  startTimer: (timeboxId: string, timeboxTitle: string, durationMs: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateTick: (payload: TickPayload) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  reset: () => void;
  restore: (state: Partial<TimerState>) => void;
};

const initialState: TimerState = {
  timeboxId: null,
  timeboxTitle: null,
  status: "idle",
  durationMs: 0,
  remainingMs: 0,
  elapsedMs: 0,
  progress: 0,
  isOvertime: false,
  startEpoch: null,
  pausedMs: 0,
  displayMode: "widget",
};

export const useTimerStore = create<TimerState & TimerActions>((set, get) => ({
  ...initialState,

  startTimer: (timeboxId, timeboxTitle, durationMs) =>
    set({
      timeboxId,
      timeboxTitle,
      status: "running",
      durationMs,
      remainingMs: durationMs,
      elapsedMs: 0,
      progress: 0,
      isOvertime: false,
      startEpoch: Date.now(),
      pausedMs: 0,
    }),

  pauseTimer: () => set({ status: "paused" }),

  resumeTimer: () => set({ status: "running" }),

  stopTimer: () => set(initialState),

  updateTick: (payload) =>
    set({
      remainingMs: payload.remainingMs,
      elapsedMs: payload.elapsedMs,
      progress: payload.progress,
      isOvertime: payload.isOvertime,
    }),

  setDisplayMode: (displayMode) => set({ displayMode }),

  reset: () => set(initialState),

  restore: (state) => set({ ...initialState, ...state }),
}));

// Selectors
export const selectIsActive = (state: TimerState) => state.status !== "idle";
export const selectIsRunning = (state: TimerState) => state.status === "running";
export const selectIsPaused = (state: TimerState) => state.status === "paused";
