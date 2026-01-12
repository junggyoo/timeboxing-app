"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useTimeboxFsm } from "../hooks/use-timebox-fsm";
import { useSingleTabEnforcement } from "../hooks/use-single-tab-enforcement";
import { BreakReadyModal } from "./break-ready-modal";
import { TabInactiveOverlay } from "./tab-inactive-overlay";
import type { DisplayMode } from "../types";

type TimerContextValue = {
  // FSM State
  state: ReturnType<typeof useTimeboxFsm>["state"];
  isIdle: boolean;
  isFocusRunning: boolean;
  isFocusPaused: boolean;
  isOvertimeRunning: boolean;
  isBreakReady: boolean;
  isBreakRunning: boolean;
  isBreakCompleted: boolean;

  // Derived states (for compatibility)
  isActive: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isOvertime: boolean;
  isBreakMode: boolean;
  status: "idle" | "running" | "paused";
  breakMode: "idle" | "focus" | "break";

  // Context values
  timeboxId: string | null;
  timeboxTitle: string | null;
  remainingMs: number;
  elapsedMs: number;
  overtimeMs: number;
  breakRemainingMs: number;
  durationMs: number;
  formattedTime: string;
  progress: number;
  displayMode: DisplayMode;

  // Actions
  start: (
    timeboxId: string,
    timeboxTitle: string,
    durationMin: number,
    scheduledStartEpoch?: number
  ) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  finishAndBreak: () => void;
  startBreak: () => void;
  skipBreak: () => void;
  dismissBreak: () => void;
  setDisplayMode: (mode: DisplayMode) => void;

  // Tab enforcement
  isActiveTab: boolean;
};

const TimerContext = createContext<TimerContextValue | null>(null);

/**
 * Hook to access timer actions within the TimerProvider context
 */
export function useTimerActions() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerActions must be used within TimerProvider");
  }
  return context;
}

/**
 * Timer Provider with FSM-based state management
 *
 * Provides:
 * - Full FSM state and actions
 * - Single tab enforcement
 * - Break ready modal
 * - Tab inactive overlay
 */
export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  // FSM hook for timer state management
  const fsm = useTimeboxFsm();

  // Single tab enforcement
  const { isActiveTab, claimOnInteraction } = useSingleTabEnforcement();

  // Dashboard store - watch for timebox deletion
  const { timeBoxIds } = useDashboardStore(
    useShallow((s) => ({
      timeBoxIds: new Set(s.timeBox.map((item) => item.id)),
    }))
  );

  // Ref to track current timebox for deletion detection
  const currentTimeboxIdRef = useRef(fsm.timeboxId);
  currentTimeboxIdRef.current = fsm.timeboxId;

  // Watch for timebox deletion - stop timer if the active timebox is deleted
  useEffect(() => {
    if (!fsm.isActive || !fsm.timeboxId) return;

    // If the current timebox is no longer in the list, stop the timer
    if (!timeBoxIds.has(fsm.timeboxId)) {
      fsm.stop();

      toast({
        title: "Timer stopped",
        description: "The timebox was deleted.",
        variant: "destructive",
      });
    }
  }, [fsm.isActive, fsm.timeboxId, timeBoxIds, toast, fsm.stop]);

  // Claim active tab on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      claimOnInteraction();
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [claimOnInteraction]);

  // Context value combining FSM state and tab enforcement
  const value: TimerContextValue = {
    // FSM State
    state: fsm.state,
    isIdle: fsm.isIdle,
    isFocusRunning: fsm.isFocusRunning,
    isFocusPaused: fsm.isFocusPaused,
    isOvertimeRunning: fsm.isOvertimeRunning,
    isBreakReady: fsm.isBreakReady,
    isBreakRunning: fsm.isBreakRunning,
    isBreakCompleted: fsm.isBreakCompleted,

    // Derived states
    isActive: fsm.isActive,
    isRunning: fsm.isRunning,
    isPaused: fsm.isPaused,
    isOvertime: fsm.isOvertime,
    isBreakMode: fsm.isBreakMode,
    status: fsm.status,
    breakMode: fsm.breakMode,

    // Context values
    timeboxId: fsm.timeboxId,
    timeboxTitle: fsm.timeboxTitle,
    remainingMs: fsm.remainingMs,
    elapsedMs: fsm.elapsedMs,
    overtimeMs: fsm.overtimeMs,
    breakRemainingMs: fsm.breakRemainingMs,
    durationMs: fsm.durationMs,
    formattedTime: fsm.formattedTime,
    progress: fsm.progress,
    displayMode: fsm.displayMode,

    // Actions (guarded by isActiveTab check)
    start: (timeboxId, timeboxTitle, durationMin, scheduledStartEpoch) => {
      if (!isActiveTab) return;
      fsm.start(timeboxId, timeboxTitle, durationMin, scheduledStartEpoch);
    },
    pause: () => {
      if (!isActiveTab) return;
      fsm.pause();
    },
    resume: () => {
      if (!isActiveTab) return;
      fsm.resume();
    },
    stop: () => {
      if (!isActiveTab) return;
      fsm.stop();
    },
    finishAndBreak: () => {
      if (!isActiveTab) return;
      fsm.finishAndBreak();
    },
    startBreak: () => {
      if (!isActiveTab) return;
      fsm.startBreak();
    },
    skipBreak: () => {
      if (!isActiveTab) return;
      fsm.skipBreak();
    },
    dismissBreak: () => {
      if (!isActiveTab) return;
      fsm.dismissBreak();
    },
    setDisplayMode: fsm.setDisplayMode,

    // Tab enforcement
    isActiveTab,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
      {/* Modals and overlays */}
      <BreakReadyModal />
      <TabInactiveOverlay />
    </TimerContext.Provider>
  );
}
