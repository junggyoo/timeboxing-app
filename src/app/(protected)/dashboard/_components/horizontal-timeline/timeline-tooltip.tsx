"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TimelineTooltipProps = {
  title: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  children: React.ReactNode;
};

/**
 * Tooltip wrapper for time blocks showing full title and time range.
 * Essential for narrow blocks (10-minute tasks) where text is truncated.
 */
export function TimelineTooltip({
  title,
  startAt,
  endAt,
  durationMin,
  children,
}: TimelineTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">
            {startAt} - {endAt} ({durationMin}분)
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
