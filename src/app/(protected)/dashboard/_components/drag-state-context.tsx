"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";

type DragState = {
  targetHour: number | null;
  targetMinute: number | null;
  isCollision: boolean;
  isDragging: boolean;
  setTargetPosition: (hour: number, minute: number, timeBox: TimeBoxItem[]) => void;
  clearTarget: () => void;
  setIsDragging: (isDragging: boolean) => void;
  // Resize state tracking to prevent accidental clicks after resize
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
  wasJustResizing: () => boolean;
};

const DragStateContext = createContext<DragState | null>(null);

const DEFAULT_DURATION = 30;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function hasTimeOverlap(
  newStart: number,
  newEnd: number,
  existingStart: number,
  existingEnd: number
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}

function checkCollision(
  timeBox: TimeBoxItem[],
  hour: number,
  minute: number,
  duration: number = DEFAULT_DURATION
): boolean {
  const newStartMinutes = hour * 60 + minute;
  const newEndMinutes = newStartMinutes + duration;

  return timeBox.some((item) => {
    const existingStart = timeToMinutes(item.startAt);
    const existingEnd = existingStart + item.durationMin;
    return hasTimeOverlap(newStartMinutes, newEndMinutes, existingStart, existingEnd);
  });
}

type DragStateProviderProps = {
  children: ReactNode;
};

// Threshold in ms to consider a click as "just after resize"
const RESIZE_CLICK_THRESHOLD = 150;

export function DragStateProvider({ children }: DragStateProviderProps) {
  const [targetHour, setTargetHour] = useState<number | null>(null);
  const [targetMinute, setTargetMinute] = useState<number | null>(null);
  const [isCollision, setIsCollision] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizingState] = useState(false);
  const lastResizeEndTimeRef = useRef<number>(0);

  // Track resize state and record end time
  const setIsResizing = useCallback((resizing: boolean) => {
    setIsResizingState(resizing);
    if (!resizing) {
      // Record when resize ended
      lastResizeEndTimeRef.current = Date.now();
    }
  }, []);

  // Check if a resize just ended (within threshold)
  const wasJustResizing = useCallback(() => {
    return Date.now() - lastResizeEndTimeRef.current < RESIZE_CLICK_THRESHOLD;
  }, []);

  const setTargetPosition = useCallback(
    (hour: number, minute: number, timeBox: TimeBoxItem[]) => {
      setTargetHour(hour);
      setTargetMinute(minute);
      setIsCollision(checkCollision(timeBox, hour, minute));
    },
    []
  );

  const clearTarget = useCallback(() => {
    setTargetHour(null);
    setTargetMinute(null);
    setIsCollision(false);
  }, []);

  return (
    <DragStateContext.Provider
      value={{
        targetHour,
        targetMinute,
        isCollision,
        isDragging,
        setTargetPosition,
        clearTarget,
        setIsDragging,
        isResizing,
        setIsResizing,
        wasJustResizing,
      }}
    >
      {children}
    </DragStateContext.Provider>
  );
}

export function useDragState(): DragState {
  const context = useContext(DragStateContext);
  if (!context) {
    throw new Error("useDragState must be used within a DragStateProvider");
  }
  return context;
}
