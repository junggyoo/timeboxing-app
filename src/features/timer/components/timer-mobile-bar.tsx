"use client";

import { cn } from "@/lib/utils";
import { MOBILE_BAR_HEIGHT } from "../constants";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";
import { useTimerStore } from "../store/timer-store";
import { useTimerActions } from "./timer-provider";
import { formatTime } from "../lib/format-time";

export function TimerMobileBar() {
  // Get state directly from store
  const isActive = useTimerStore((s) => s.status !== "idle");
  const displayMode = useTimerStore((s) => s.displayMode);
  const isOvertime = useTimerStore((s) => s.isOvertime);
  const remainingMs = useTimerStore((s) => s.remainingMs);
  const timeboxTitle = useTimerStore((s) => s.timeboxTitle);
  const status = useTimerStore((s) => s.status);
  const setDisplayMode = useTimerStore((s) => s.setDisplayMode);

  // Get actions from provider
  const { pause, resume, stop } = useTimerActions();

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const formattedTime = formatTime(remainingMs, isOvertime);

  // Don't render if timer is not active
  if (!isActive) {
    return null;
  }

  // Only render in minimized mode or for mobile
  if (displayMode === "fullscreen") {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the bar */}
      <div style={{ height: MOBILE_BAR_HEIGHT }} className="md:hidden" />

      {/* Mobile bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden",
          isOvertime && "border-red-500/50 bg-red-950/10"
        )}
        style={{ height: MOBILE_BAR_HEIGHT }}
      >
        <div className="flex h-full items-center justify-between px-4">
          {/* Left side - tap to expand */}
          <button
            className="flex flex-1 items-center gap-3"
            onClick={() => setDisplayMode("fullscreen")}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                isOvertime ? "bg-red-500/20" : "bg-primary/20"
              )}
            >
              <TimerDisplay
                formattedTime={formattedTime}
                isOvertime={isOvertime}
                isPaused={isPaused}
                size="sm"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="line-clamp-1 text-sm font-medium">
                {timeboxTitle}
              </span>
              <span className="text-xs text-muted-foreground">
                Tap to expand
              </span>
            </div>
          </button>

          {/* Right side - controls */}
          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            size="sm"
          />
        </div>
      </div>

      {/* Desktop minimized bar */}
      <div
        className={cn(
          "fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm md:block",
          displayMode !== "minimized" && "md:hidden",
          isOvertime && "border-red-500/50 bg-red-950/10"
        )}
      >
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-3"
            onClick={() => setDisplayMode("widget")}
          >
            <TimerDisplay
              formattedTime={formattedTime}
              isOvertime={isOvertime}
              isPaused={isPaused}
              size="sm"
            />
            <span className="max-w-[150px] truncate text-sm font-medium">
              {timeboxTitle}
            </span>
          </button>

          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            size="sm"
          />
        </div>
      </div>
    </>
  );
}
