"use client";

import { cn } from "@/lib/utils";
import { TIMER_COLORS } from "../constants";

type TimerProgressRingProps = {
  progress: number;
  isOvertime: boolean;
  isPaused: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
};

export function TimerProgressRing({
  progress,
  isOvertime,
  isPaused,
  size = 120,
  strokeWidth = 8,
  className,
  children,
}: TimerProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  const getColor = () => {
    if (isOvertime) return TIMER_COLORS.overtime.ring;
    if (isPaused) return TIMER_COLORS.paused.ring;
    return TIMER_COLORS.normal.ring;
  };

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-200",
            isOvertime && "animate-pulse"
          )}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
