"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coffee, Minimize2 } from "lucide-react";
import { useTimerActions } from "./timer-provider";
import { BREAK_COLORS } from "../constants";
import { formatTime } from "../lib/format-time";

/**
 * Break mode countdown overlay.
 *
 * Displays a full-screen overlay during break time with:
 * - Visual progress ring
 * - Remaining break time
 * - Minimize button (to continue break in widget mode)
 * - Skip break button
 */
export function BreakCountdown() {
  const { isBreakMode, isBreakRunning, breakRemainingMs, skipBreak, setDisplayMode, displayMode } =
    useTimerActions();

  // Calculate progress
  const breakDurationMs = 5 * 60 * 1000; // 5 minutes default
  const breakProgress =
    breakDurationMs > 0 ? 1 - breakRemainingMs / breakDurationMs : 0;
  const formattedBreakTime = formatTime(breakRemainingMs, false);

  // Don't render if not in break mode
  if (!isBreakMode && !isBreakRunning) return null;

  // Don't render fullscreen overlay if displayMode is widget or minimized
  if (displayMode !== "fullscreen") return null;

  // Ring calculations
  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - breakProgress * circumference;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "flex flex-col items-center justify-center",
        "bg-emerald-950/95 backdrop-blur-sm",
        "animate-in fade-in duration-300"
      )}
    >
      {/* Minimize button - continues break in widget mode */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
        onClick={() => setDisplayMode("widget")}
      >
        <Minimize2 className="h-5 w-5" />
        <span className="sr-only">Minimize</span>
      </Button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-8 text-emerald-300">
        <Coffee className="h-6 w-6" />
        <h2 className="text-xl font-medium">휴식 시간</h2>
      </div>

      {/* Progress ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-emerald-900/50"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={BREAK_COLORS.ring}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-200"
          />
        </svg>

        {/* Center content - Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-white tabular-nums">
            {formattedBreakTime}
          </span>
          <span className="text-sm text-emerald-300 mt-1">남음</span>
        </div>
      </div>

      {/* Skip button */}
      <Button
        variant="outline"
        className={cn(
          "mt-10",
          "border-emerald-700 text-emerald-200",
          "hover:bg-emerald-800 hover:text-white hover:border-emerald-600",
          "transition-colors"
        )}
        onClick={skipBreak}
      >
        휴식 건너뛰기
      </Button>

      {/* Encouraging message */}
      <p className="mt-6 text-sm text-emerald-400/80 max-w-xs text-center">
        잠시 눈을 쉬거나, 스트레칭을 하거나, 음료를 마시세요.
      </p>
    </div>
  );
}
