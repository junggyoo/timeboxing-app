"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimerProgressRing } from "./timer-progress-ring";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import { useTimerActions } from "./timer-provider";
import { formatTime } from "../lib/format-time";

export function TimerFullscreen() {
  // Get state and actions from provider (FSM-based)
  const {
    isActive,
    isRunning,
    isPaused,
    isOvertime,
    displayMode,
    progress,
    remainingMs,
    overtimeMs,
    timeboxTitle,
    pause,
    resume,
    stop,
    finishAndBreak,
    setDisplayMode,
  } = useTimerActions();

  const formattedTime = isOvertime
    ? formatTime(overtimeMs, true)
    : formatTime(remainingMs, false);

  const handleClose = useCallback(() => {
    setDisplayMode("widget");
  }, [setDisplayMode]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // Don't render if timer is not active or not in fullscreen mode
  if (!isActive || displayMode !== "fullscreen") {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center",
        "bg-background/95 backdrop-blur-sm",
        isOvertime && "bg-red-950/20"
      )}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 h-10 w-10"
        onClick={handleClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Exit fullscreen</span>
      </Button>

      {/* Timer content */}
      <div className="flex flex-col items-center gap-8">
        <TimerProgressRing
          progress={progress}
          isOvertime={isOvertime}
          isPaused={isPaused}
          size={280}
          strokeWidth={12}
        >
          <TimerDisplay
            formattedTime={formattedTime}
            isOvertime={isOvertime}
            isPaused={isPaused}
            size="lg"
          />
        </TimerProgressRing>

        <h2 className="max-w-md text-center text-2xl font-semibold">
          {timeboxTitle}
        </h2>

        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          isOvertime={isOvertime}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          onFinishAndBreak={finishAndBreak}
          size="lg"
        />

        <p className="text-sm text-muted-foreground">
          Press <kbd className="rounded border px-1.5 py-0.5 text-xs">Esc</kbd> to exit fullscreen
        </p>
      </div>
    </div>
  );
}
