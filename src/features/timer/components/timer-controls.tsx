"use client";

import { Button } from "@/components/ui/button";
import { Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerControlsProps = {
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
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
  onPause,
  onResume,
  onStop,
  size = "md",
  className,
}: TimerControlsProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
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
