import { useCallback, useState, type RefObject } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { MINUTE_GRID, MIN_DURATION } from "./constants";
import { snapToGrid, formatTime } from "./use-block-position";

type UseHorizontalDragOptions = {
  item: TimeBoxItem;
  rowRef: RefObject<HTMLDivElement | null>;
  rowHour: number;
  onStartTimeChange: (id: string, startAt: string) => void;
};

type UseHorizontalDragReturn = {
  isDragging: boolean;
  handleDragStart: (e: React.MouseEvent) => void;
};

/**
 * Hook for horizontal drag functionality.
 * Allows dragging the block body to move its start time within the hour.
 * Snaps to 10-minute grid intervals.
 */
export function useHorizontalDrag({
  item,
  rowRef,
  rowHour,
  onStartTimeChange,
}: UseHorizontalDragOptions): UseHorizontalDragReturn {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);

      const rowWidth = rowRef.current?.offsetWidth ?? 1;
      const startX = e.clientX;
      const [, startMinute] = item.startAt.split(":").map(Number);
      const duration = item.durationMin;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        // Convert pixel delta to minute delta
        const minutesPerPixel = 60 / rowWidth;
        const rawDeltaMin = deltaX * minutesPerPixel;
        // Snap to grid
        const deltaMin = snapToGrid(rawDeltaMin, MINUTE_GRID);

        // Calculate new start minute
        const newMinute = startMinute + deltaMin;
        // Clamp to stay within hour boundaries
        // Max start minute = 60 - duration (to keep entire block within hour)
        const maxStartMinute = Math.max(0, 60 - Math.min(duration, 60));
        const clampedMinute = Math.max(0, Math.min(maxStartMinute, newMinute));
        // Ensure it snaps to grid
        const snappedMinute = snapToGrid(clampedMinute, MINUTE_GRID);

        const newStartAt = formatTime(rowHour, snappedMinute);
        onStartTimeChange(item.id, newStartAt);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [item.id, item.startAt, item.durationMin, rowRef, rowHour, onStartTimeChange]
  );

  return { isDragging, handleDragStart };
}
