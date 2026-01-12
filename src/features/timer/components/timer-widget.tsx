"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Expand, Minimize2, GripHorizontal, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_WIDGET_POSITION, WIDGET_POSITION_KEY, WIDGET_SIZE, BREAK_COLORS } from "../constants";
import { TimerProgressRing } from "./timer-progress-ring";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import { useTimerActions } from "./timer-provider";

type Position = { x: number; y: number };

function loadPosition(): Position {
  if (typeof window === "undefined") return DEFAULT_WIDGET_POSITION;
  try {
    const saved = localStorage.getItem(WIDGET_POSITION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return DEFAULT_WIDGET_POSITION;
}

function savePosition(pos: Position) {
  try {
    localStorage.setItem(WIDGET_POSITION_KEY, JSON.stringify(pos));
  } catch {
    // Ignore
  }
}

export function TimerWidget() {
  // Get state and actions from provider (FSM-based)
  const {
    isActive,
    isRunning,
    isPaused,
    isOvertime,
    isBreakMode,
    isBreakRunning,
    displayMode,
    progress,
    remainingMs,
    overtimeMs,
    breakRemainingMs,
    durationMs,
    timeboxTitle,
    pause,
    resume,
    stop,
    finishAndBreak,
    skipBreak,
    setDisplayMode,
  } = useTimerActions();

  const [position, setPosition] = useState<Position>(DEFAULT_WIDGET_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(position);
  positionRef.current = position;

  // Load saved position on mount
  useEffect(() => {
    setPosition(loadPosition());
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: positionRef.current.x,
      posY: positionRef.current.y,
    };
  }, []);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;

    // Calculate delta from drag start
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Since we're using right/bottom positioning:
    // - Moving mouse right (positive deltaX) should decrease right value
    // - Moving mouse down (positive deltaY) should decrease bottom value
    const newX = dragStartRef.current.posX - deltaX;
    const newY = dragStartRef.current.posY - deltaY;

    // Clamp to viewport (position values are distances from right/bottom edges)
    // Minimum: 16px from edge, Maximum: viewport size - widget size - 16px
    const minPos = 16;
    const maxX = window.innerWidth - WIDGET_SIZE.width - 16;
    const maxY = window.innerHeight - WIDGET_SIZE.height - 16;

    const clampedPos = {
      x: Math.max(minPos, Math.min(newX, maxX)),
      y: Math.max(minPos, Math.min(newY, maxY)),
    };

    setPosition(clampedPos);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (dragStartRef.current) {
      savePosition(positionRef.current);
    }
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Format time
  const formatTimeDisplay = (ms: number, overtime: boolean): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    return overtime ? `+${formatted}` : formatted;
  };

  // Calculate break progress
  const breakDurationMs = 5 * 60 * 1000; // 5 minutes default
  const breakProgress = breakDurationMs > 0 ? 1 - breakRemainingMs / breakDurationMs : 0;

  const formattedTime = isBreakMode
    ? formatTimeDisplay(breakRemainingMs, false)
    : isOvertime
      ? formatTimeDisplay(overtimeMs, true)
      : formatTimeDisplay(remainingMs, false);

  // Don't render if timer is not active
  if (!isActive) {
    return null;
  }

  // Don't render widget if in fullscreen or minimized mode
  if (displayMode !== "widget") {
    return null;
  }

  // Break mode widget
  if (isBreakMode) {
    return (
      <Card
        ref={widgetRef}
        className={cn(
          "fixed z-50 flex flex-col gap-3 p-4 shadow-lg",
          "bg-emerald-950/95 border-emerald-700",
          isDragging && "cursor-grabbing opacity-90"
        )}
        style={{
          right: position.x,
          bottom: position.y,
          width: WIDGET_SIZE.width,
        }}
      >
        {/* Drag handle */}
        <div
          className="absolute left-0 right-0 top-0 flex h-6 cursor-grab items-center justify-center"
          onMouseDown={handleDragStart}
        >
          <GripHorizontal className="h-4 w-4 text-emerald-500/50" />
        </div>

        {/* Controls in top right */}
        <div className="absolute right-2 top-1 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800"
            onClick={() => setDisplayMode("minimized")}
          >
            <Minimize2 className="h-3 w-3" />
            <span className="sr-only">Minimize</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800"
            onClick={() => setDisplayMode("fullscreen")}
          >
            <Expand className="h-3 w-3" />
            <span className="sr-only">Fullscreen</span>
          </Button>
        </div>

        {/* Break content */}
        <div className="mt-4 flex items-center gap-3">
          {/* Break progress ring */}
          <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
            <svg className="transform -rotate-90" width={64} height={64}>
              <circle
                cx={32}
                cy={32}
                r={27}
                fill="none"
                stroke="currentColor"
                strokeWidth={5}
                className="text-emerald-900/50"
              />
              <circle
                cx={32}
                cy={32}
                r={27}
                fill="none"
                stroke={BREAK_COLORS.ring}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={27 * 2 * Math.PI}
                strokeDashoffset={(27 * 2 * Math.PI) - breakProgress * (27 * 2 * Math.PI)}
                className="transition-all duration-200"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-mono font-bold text-white tabular-nums">
                {formattedTime}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Coffee className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium truncate">휴식 중</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-emerald-700 text-emerald-200 hover:bg-emerald-800 hover:text-white text-xs"
              onClick={skipBreak}
            >
              휴식 건너뛰기
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Focus mode widget
  return (
    <Card
      ref={widgetRef}
      className={cn(
        "fixed z-50 flex flex-col gap-3 p-4 shadow-lg",
        isDragging && "cursor-grabbing opacity-90"
      )}
      style={{
        right: position.x,
        bottom: position.y,
        width: WIDGET_SIZE.width,
      }}
    >
      {/* Drag handle */}
      <div
        className="absolute left-0 right-0 top-0 flex h-6 cursor-grab items-center justify-center"
        onMouseDown={handleDragStart}
      >
        <GripHorizontal className="h-4 w-4 text-muted-foreground/50" />
      </div>

      {/* Controls in top right */}
      <div className="absolute right-2 top-1 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDisplayMode("minimized")}
        >
          <Minimize2 className="h-3 w-3" />
          <span className="sr-only">Minimize</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDisplayMode("fullscreen")}
        >
          <Expand className="h-3 w-3" />
          <span className="sr-only">Fullscreen</span>
        </Button>
      </div>

      {/* Timer content */}
      <div className="mt-4 flex items-center gap-4">
        <TimerProgressRing
          progress={progress}
          isOvertime={isOvertime}
          isPaused={isPaused}
          size={80}
          strokeWidth={6}
        >
          <TimerDisplay
            formattedTime={formattedTime}
            isOvertime={isOvertime}
            isPaused={isPaused}
            size="sm"
          />
        </TimerProgressRing>

        <div className="flex flex-1 flex-col gap-2">
          <p className="line-clamp-2 text-sm font-medium">{timeboxTitle}</p>
          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            isOvertime={isOvertime}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            onFinishAndBreak={finishAndBreak}
            size="sm"
          />
        </div>
      </div>
    </Card>
  );
}
