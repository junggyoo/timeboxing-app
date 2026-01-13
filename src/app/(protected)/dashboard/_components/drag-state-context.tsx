"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";

// Ghost data for rendering the dragged block visually
export type GhostData = {
  title: string;
  width: number;
  height: number;
  color: { bg: string; border: string };
};

// Input type for ghost data (without dimensions, which are calculated at drag start)
export type GhostDataInput = {
  title: string;
  color: { bg: string; border: string };
};

// Block drag state for drag-and-drop within timeline
type BlockDragState = {
  blockId: string | null;
  originalStartAt: string | null;
  durationMin: number;
  targetHour: number | null;
  targetMinute: number | null;
  isCollision: boolean;
  // Ghost element data for visual feedback
  ghostData: GhostData | null;
  // Cursor offset from block origin for accurate ghost positioning
  cursorOffset: { x: number; y: number } | null;
};

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
  // Block drag state tracking to prevent accidental clicks after drag
  wasJustBlockDragging: () => boolean;
  // Block drag state for timeline block repositioning
  blockDrag: BlockDragState;
  startBlockDrag: (blockId: string, startAt: string, durationMin: number) => void;
  startBlockDragWithGhost: (
    blockId: string,
    startAt: string,
    durationMin: number,
    ghostData: GhostData,
    cursorOffset: { x: number; y: number }
  ) => void;
  updateBlockDragTarget: (hour: number, minute: number, timeBox: TimeBoxItem[], excludeBlockId: string) => void;
  endBlockDrag: () => { targetHour: number | null; targetMinute: number | null; isCollision: boolean };
  clearBlockDrag: () => void;
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
  duration: number = DEFAULT_DURATION,
  excludeBlockId?: string
): boolean {
  const newStartMinutes = hour * 60 + minute;
  const newEndMinutes = newStartMinutes + duration;

  return timeBox.some((item) => {
    // Skip the block being dragged
    if (excludeBlockId && item.id === excludeBlockId) return false;
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
  const lastBlockDragEndTimeRef = useRef<number>(0);

  // Block drag state
  const [blockDrag, setBlockDrag] = useState<BlockDragState>({
    blockId: null,
    originalStartAt: null,
    durationMin: 30,
    targetHour: null,
    targetMinute: null,
    isCollision: false,
    ghostData: null,
    cursorOffset: null,
  });

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

  // Check if a block drag just ended (within threshold)
  const wasJustBlockDragging = useCallback(() => {
    return Date.now() - lastBlockDragEndTimeRef.current < RESIZE_CLICK_THRESHOLD;
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

  // Block drag functions
  const startBlockDrag = useCallback((blockId: string, startAt: string, durationMin: number) => {
    setBlockDrag({
      blockId,
      originalStartAt: startAt,
      durationMin,
      targetHour: null,
      targetMinute: null,
      isCollision: false,
      ghostData: null,
      cursorOffset: null,
    });
  }, []);

  // Start block drag with ghost element data for visual feedback
  const startBlockDragWithGhost = useCallback(
    (
      blockId: string,
      startAt: string,
      durationMin: number,
      ghostData: GhostData,
      cursorOffset: { x: number; y: number }
    ) => {
      setBlockDrag({
        blockId,
        originalStartAt: startAt,
        durationMin,
        targetHour: null,
        targetMinute: null,
        isCollision: false,
        ghostData,
        cursorOffset,
      });
    },
    []
  );

  const updateBlockDragTarget = useCallback(
    (hour: number, minute: number, timeBox: TimeBoxItem[], excludeBlockId: string) => {
      setBlockDrag((prev) => ({
        ...prev,
        targetHour: hour,
        targetMinute: minute,
        isCollision: checkCollision(timeBox, hour, minute, prev.durationMin, excludeBlockId),
      }));
    },
    []
  );

  const endBlockDrag = useCallback(() => {
    const result = {
      targetHour: blockDrag.targetHour,
      targetMinute: blockDrag.targetMinute,
      isCollision: blockDrag.isCollision,
    };
    return result;
  }, [blockDrag.targetHour, blockDrag.targetMinute, blockDrag.isCollision]);

  const clearBlockDrag = useCallback(() => {
    // Record when block drag ended
    lastBlockDragEndTimeRef.current = Date.now();
    setBlockDrag({
      blockId: null,
      originalStartAt: null,
      durationMin: 30,
      targetHour: null,
      targetMinute: null,
      isCollision: false,
      ghostData: null,
      cursorOffset: null,
    });
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
        wasJustBlockDragging,
        blockDrag,
        startBlockDrag,
        startBlockDragWithGhost,
        updateBlockDragTarget,
        endBlockDrag,
        clearBlockDrag,
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
