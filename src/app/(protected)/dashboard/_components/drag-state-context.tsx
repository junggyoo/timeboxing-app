"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";

type DragState = {
  targetHour: number | null;
  targetMinute: number | null;
  isCollision: boolean;
  isDragging: boolean;
  setTargetPosition: (hour: number, minute: number, timeBox: TimeBoxItem[]) => void;
  clearTarget: () => void;
  setIsDragging: (isDragging: boolean) => void;
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

export function DragStateProvider({ children }: DragStateProviderProps) {
  const [targetHour, setTargetHour] = useState<number | null>(null);
  const [targetMinute, setTargetMinute] = useState<number | null>(null);
  const [isCollision, setIsCollision] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
