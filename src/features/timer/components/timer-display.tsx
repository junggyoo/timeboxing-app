"use client";

import { cn } from "@/lib/utils";
import { TIMER_COLORS } from "../constants";

type TimerDisplayProps = {
  formattedTime: string;
  isOvertime: boolean;
  isPaused: boolean;
  taskTitle?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles = {
  sm: {
    time: "text-2xl",
    title: "text-xs",
  },
  md: {
    time: "text-4xl",
    title: "text-sm",
  },
  lg: {
    time: "text-6xl",
    title: "text-lg",
  },
};

export function TimerDisplay({
  formattedTime,
  isOvertime,
  isPaused,
  taskTitle,
  size = "md",
  className,
}: TimerDisplayProps) {
  const getTextColor = () => {
    if (isOvertime) return TIMER_COLORS.overtime.text;
    if (isPaused) return TIMER_COLORS.paused.text;
    return TIMER_COLORS.normal.text;
  };

  const styles = sizeStyles[size];

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <span
        className={cn(
          "font-mono font-bold tabular-nums",
          styles.time,
          isOvertime && "animate-pulse"
        )}
        style={{ color: getTextColor() }}
      >
        {formattedTime}
      </span>
      {taskTitle && (
        <span
          className={cn(
            "max-w-[200px] truncate text-muted-foreground",
            styles.title
          )}
        >
          {taskTitle}
        </span>
      )}
    </div>
  );
}
