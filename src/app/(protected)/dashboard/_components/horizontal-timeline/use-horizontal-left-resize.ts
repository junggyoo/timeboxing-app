import { useCallback, useState, type RefObject } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { MINUTE_GRID, MIN_DURATION, HOUR_HEIGHT } from "./constants";
import { snapToGrid } from "./use-block-position";

type UseHorizontalLeftResizeOptions = {
  item: TimeBoxItem;
  rowRef: RefObject<HTMLDivElement | null>;
  onLeftResize: (id: string, startAt: string, durationMin: number) => void;
  onResizeStateChange?: (isResizing: boolean) => void;
};

type UseHorizontalLeftResizeReturn = {
  isLeftResizing: boolean;
  handleLeftResizeStart: (e: React.MouseEvent) => void;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Hook for left-side resize functionality.
 * - Dragging left: decreases startAt, increases duration (endAt stays fixed)
 * - Dragging right: increases startAt, decreases duration (endAt stays fixed)
 * Snaps to 10-minute grid intervals.
 */
export function useHorizontalLeftResize({
  item,
  rowRef,
  onLeftResize,
  onResizeStateChange,
}: UseHorizontalLeftResizeOptions): UseHorizontalLeftResizeReturn {
  const [isLeftResizing, setIsLeftResizing] = useState(false);

  const handleLeftResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsLeftResizing(true);
      onResizeStateChange?.(true);

      const rowWidth = rowRef.current?.offsetWidth ?? 1;
      const startX = e.clientX;
      const startY = e.clientY;
      const startStartAt = item.startAt;
      const startDuration = item.durationMin;
      const startMinutes = timeToMinutes(startStartAt);
      // Calculate endAt in minutes (this stays fixed during left resize)
      const endMinutes = startMinutes + startDuration;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        // Convert horizontal pixel delta to minute delta (within hour)
        const minutesPerPixelX = 60 / rowWidth;
        const horizontalMinDelta = deltaX * minutesPerPixelX;

        // Convert vertical pixel delta to minute delta (across hours)
        const minutesPerPixelY = 60 / HOUR_HEIGHT;
        const verticalMinDelta = deltaY * minutesPerPixelY;

        // Combine both deltas (positive = moving right = later start time)
        const totalRawDelta = horizontalMinDelta + verticalMinDelta;

        // Snap to grid
        const deltaMin = snapToGrid(totalRawDelta, MINUTE_GRID);

        // Calculate new start time
        let newStartMinutes = startMinutes + deltaMin;

        // Enforce minimum duration (endAt - startAt >= MIN_DURATION)
        const maxStartMinutes = endMinutes - MIN_DURATION;
        newStartMinutes = Math.min(newStartMinutes, maxStartMinutes);

        // Don't allow negative start time
        newStartMinutes = Math.max(0, newStartMinutes);

        // Calculate new duration (endAt stays fixed)
        const newDuration = endMinutes - newStartMinutes;

        const newStartAt = minutesToTime(newStartMinutes);
        onLeftResize(item.id, newStartAt, newDuration);
      };

      const handleMouseUp = () => {
        setIsLeftResizing(false);
        onResizeStateChange?.(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [item.id, item.startAt, item.durationMin, rowRef, onLeftResize, onResizeStateChange]
  );

  return { isLeftResizing, handleLeftResizeStart };
}
