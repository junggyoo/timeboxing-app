"use client";

import { useState, useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useShallow } from "zustand/react/shallow";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { HourRow } from "./hour-row";
import { HOURS_TO_DISPLAY, MIN_DURATION } from "./constants";
import { calculateEndTime, getTaskHourSpan } from "./use-block-position";

/**
 * Group items by hour for rendering in hour rows.
 * Items spanning multiple hours appear in each relevant hour row.
 */
function groupItemsByHour(
  items: TimeBoxItem[],
  startHour: number,
  hoursToDisplay: number
): Map<number, TimeBoxItem[]> {
  const grouped = new Map<number, TimeBoxItem[]>();

  // Initialize all visible hours
  for (let i = 0; i < hoursToDisplay; i++) {
    const hour = (startHour + i) % 24;
    grouped.set(hour, []);
  }

  // Group items by their hour span
  items.forEach((item) => {
    const hours = getTaskHourSpan(item);
    hours.forEach((hour) => {
      if (grouped.has(hour)) {
        grouped.get(hour)!.push(item);
      }
    });
  });

  return grouped;
}

/**
 * Check if an item is visible within the display range.
 */
function isItemVisible(
  item: TimeBoxItem,
  startHour: number,
  hoursToDisplay: number
): boolean {
  const [hours] = item.startAt.split(":").map(Number);
  const endHour = (startHour + hoursToDisplay) % 24;

  // Handle midnight crossing
  if (startHour < endHour) {
    return hours >= startHour && hours < endHour;
  } else {
    return hours >= startHour || hours < endHour;
  }
}

type HorizontalTimelineProps = {
  fullHeight?: boolean;
};

/**
 * Horizontal timeline layout for desktop.
 * Displays hours as rows with tasks positioned horizontally within each hour.
 */
export function HorizontalTimeline({ fullHeight }: HorizontalTimelineProps) {
  const { items, addTimeBox } = useDashboardStore(
    useShallow((state) => ({
      items: state.timeBox,
      addTimeBox: state.addTimeBox,
    }))
  );

  const [startHour, setStartHour] = useState(6);

  // Generate hour list for display
  const hours = useMemo(() => {
    return Array.from({ length: HOURS_TO_DISPLAY }, (_, i) => (startHour + i) % 24);
  }, [startHour]);

  // Filter visible items and group by hour
  const visibleItems = useMemo(() => {
    return items.filter((item) => isItemVisible(item, startHour, HOURS_TO_DISPLAY));
  }, [items, startHour]);

  const itemsByHour = useMemo(() => {
    return groupItemsByHour(visibleItems, startHour, HOURS_TO_DISPLAY);
  }, [visibleItems, startHour]);

  // Handle task creation from inline input
  const handleCreateTask = useCallback(
    (startAt: string, title: string) => {
      addTimeBox({
        title,
        startAt,
        endAt: calculateEndTime(startAt, MIN_DURATION),
        durationMin: MIN_DURATION,
        status: "scheduled",
      });
    },
    [addTimeBox]
  );

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Time Box</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Start at:</span>
          <Select
            value={startHour.toString()}
            onValueChange={(v) => setStartHour(Number(v))}
          >
            <SelectTrigger className="h-7 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 13 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {`${i.toString().padStart(2, "0")}:00`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            {items.length}개 일정
          </Badge>
        </div>
      </div>

      {/* Timeline content - extra right padding for resize handles */}
      <ScrollArea className="flex-1">
        <div className="py-2 pl-2 pr-6">
          {hours.map((hour) => (
            <HourRow
              key={hour}
              hour={hour}
              items={itemsByHour.get(hour) || []}
              onCreateTask={handleCreateTask}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
