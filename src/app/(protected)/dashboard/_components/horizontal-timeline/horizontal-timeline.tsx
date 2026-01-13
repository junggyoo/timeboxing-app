"use client";

import { useState, useMemo, useCallback } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DEFAULT_DURATION } from "./constants";
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

const MAX_END_HOUR = 30; // 최대 종료 시간 (다음 날 06:00까지)

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
  const [endHour, setEndHour] = useState(24); // 기본값: 24:00 (자정)

  // Calculate hours to display dynamically
  const hoursToDisplay = endHour - startHour;

  // 1시간 추가 가능 여부
  const canExtend = endHour < MAX_END_HOUR;

  // 1시간 추가 핸들러
  const handleExtendHour = useCallback(() => {
    if (canExtend) {
      setEndHour((prev) => prev + 1);
    }
  }, [canExtend]);

  // Generate hour list for display
  const hours = useMemo(() => {
    return Array.from({ length: hoursToDisplay }, (_, i) => startHour + i);
  }, [startHour, hoursToDisplay]);

  // Filter visible items and group by hour
  const visibleItems = useMemo(() => {
    return items.filter((item) => isItemVisible(item, startHour, hoursToDisplay));
  }, [items, startHour, hoursToDisplay]);

  const itemsByHour = useMemo(() => {
    return groupItemsByHour(visibleItems, startHour, hoursToDisplay);
  }, [visibleItems, startHour, hoursToDisplay]);

  // Handle task creation from inline input
  const handleCreateTask = useCallback(
    (startAt: string, title: string) => {
      addTimeBox({
        title,
        startAt,
        endAt: calculateEndTime(startAt, DEFAULT_DURATION),
        durationMin: DEFAULT_DURATION,
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
              items={itemsByHour.get(hour % 24) || []}
              onCreateTask={handleCreateTask}
            />
          ))}

          {/* 1시간 추가 버튼 */}
          {canExtend && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-muted-foreground hover:text-foreground"
              onClick={handleExtendHour}
            >
              <Plus className="mr-1 h-4 w-4" />
              1시간 추가
            </Button>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
