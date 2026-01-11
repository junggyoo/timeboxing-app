"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coffee, X } from "lucide-react";
import { useBreakMode } from "../hooks/use-break-mode";
import { BREAK_COLORS } from "../constants";

/**
 * Break mode countdown overlay.
 *
 * Displays a full-screen overlay during break time with:
 * - Visual progress ring
 * - Remaining break time
 * - Skip break button
 */
export function BreakCountdown() {
  const {
    isBreakMode,
    breakRemainingMs,
    breakProgress,
    formattedBreakTime,
    skipBreak,
  } = useBreakMode();

  if (!isBreakMode) return null;

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
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
        onClick={skipBreak}
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Skip break</span>
      </Button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-8 text-emerald-300">
        <Coffee className="h-6 w-6" />
        <h2 className="text-xl font-medium">Break Time</h2>
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
          <span className="text-sm text-emerald-300 mt-1">remaining</span>
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
        Skip Break
      </Button>

      {/* Encouraging message */}
      <p className="mt-6 text-sm text-emerald-400/80 max-w-xs text-center">
        Take a moment to rest your eyes, stretch, or grab a drink.
      </p>
    </div>
  );
}
