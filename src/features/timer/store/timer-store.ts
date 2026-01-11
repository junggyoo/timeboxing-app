"use client";

import { create } from "zustand";
import type { BreakTickPayload, DisplayMode, TickPayload, TimerState } from "../types";
import { DEFAULT_BREAK_DURATION_MS } from "../constants";

type TimerActions = {
  startTimer: (timeboxId: string, timeboxTitle: string, durationMs: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateTick: (payload: TickPayload) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  reset: () => void;
  restore: (state: Partial<TimerState>) => void;
  // Break mode actions
  startBreak: (durationMs?: number) => void;
  updateBreakTick: (payload: BreakTickPayload) => void;
  endBreak: () => void;
  skipBreak: () => void;
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
  // Break mode initial state
  breakMode: "idle",
  breakDurationMs: DEFAULT_BREAK_DURATION_MS,
  breakRemainingMs: 0,
  breakProgress: 0,
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
      breakMode: "focus",
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

  // Break mode actions
  startBreak: (durationMs = DEFAULT_BREAK_DURATION_MS) =>
    set({
      breakMode: "break",
      breakDurationMs: durationMs,
      breakRemainingMs: durationMs,
      breakProgress: 0,
    }),

  updateBreakTick: (payload) =>
    set({
      breakRemainingMs: payload.remainingMs,
      breakProgress: payload.progress,
    }),

  endBreak: () =>
    set({
      breakMode: "idle",
      breakRemainingMs: 0,
      breakProgress: 0,
    }),

  skipBreak: () =>
    set({
      breakMode: "idle",
      breakRemainingMs: 0,
      breakProgress: 0,
    }),
}));

// Selectors
export const selectIsActive = (state: TimerState) => state.status !== "idle";
export const selectIsRunning = (state: TimerState) => state.status === "running";
export const selectIsPaused = (state: TimerState) => state.status === "paused";
export const selectIsBreakMode = (state: TimerState) => state.breakMode === "break";
export const selectIsFocusMode = (state: TimerState) => state.breakMode === "focus";
