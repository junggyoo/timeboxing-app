"use client";

import { Button } from "@/components/ui/button";
import { Coffee, Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerControlsProps = {
  isRunning: boolean;
  isPaused: boolean;
  isOvertime?: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onFinishAndBreak?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles = {
  sm: {
    button: "h-8 w-8",
    icon: "h-4 w-4",
  },
  md: {
    button: "h-10 w-10",
    icon: "h-5 w-5",
  },
  lg: {
    button: "h-14 w-14",
    icon: "h-7 w-7",
  },
};

export function TimerControls({
  isRunning,
  isPaused,
  isOvertime = false,
  onPause,
  onResume,
  onStop,
  onFinishAndBreak,
  size = "md",
  className,
}: TimerControlsProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Finish & Break button (shown during overtime) */}
      {isOvertime && onFinishAndBreak && (
        <Button
          onClick={onFinishAndBreak}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          size={size === "sm" ? "sm" : "default"}
        >
          <Coffee className={styles.icon} />
          <span className="hidden sm:inline">완료 및 휴식</span>
        </Button>
      )}

      {/* Pause/Resume button */}
      {isRunning ? (
        <Button
          variant="outline"
          size="icon"
          className={cn(styles.button, "rounded-full")}
          onClick={onPause}
        >
          <Pause className={styles.icon} />
          <span className="sr-only">Pause timer</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className={cn(styles.button, "rounded-full")}
          onClick={onResume}
        >
          <Play className={styles.icon} />
          <span className="sr-only">Resume timer</span>
        </Button>
      )}

      {/* Stop button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(styles.button, "rounded-full text-destructive hover:text-destructive")}
        onClick={onStop}
      >
        <Square className={styles.icon} />
        <span className="sr-only">Stop timer</span>
      </Button>
    </div>
  );
}
