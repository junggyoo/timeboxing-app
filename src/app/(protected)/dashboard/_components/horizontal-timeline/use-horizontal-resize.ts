import { useCallback, useState, type RefObject } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { MINUTE_GRID, MIN_DURATION, HOUR_HEIGHT } from "./constants";
import { snapToGrid } from "./use-block-position";

type UseHorizontalResizeOptions = {
  item: TimeBoxItem;
  rowRef: RefObject<HTMLDivElement | null>;
  onDurationChange: (id: string, durationMin: number) => void;
  onResizeStateChange?: (isResizing: boolean) => void;
};

type UseHorizontalResizeReturn = {
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent) => void;
};

/**
 * Hook for resize functionality supporting both horizontal and vertical dragging.
 * - Horizontal drag (right): extends/shrinks within the current hour
 * - Vertical drag (down): extends into subsequent hours
 * Snaps to 10-minute grid intervals.
 */
export function useHorizontalResize({
  item,
  rowRef,
  onDurationChange,
  onResizeStateChange,
}: UseHorizontalResizeOptions): UseHorizontalResizeReturn {
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      onResizeStateChange?.(true);

      const rowWidth = rowRef.current?.offsetWidth ?? 1;
      const startX = e.clientX;
      const startY = e.clientY;
      const startDuration = item.durationMin;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        // Convert horizontal pixel delta to minute delta (within hour)
        const minutesPerPixelX = 60 / rowWidth;
        const horizontalMinDelta = deltaX * minutesPerPixelX;

        // Convert vertical pixel delta to minute delta (across hours)
        // Each row represents 60 minutes
        const minutesPerPixelY = 60 / HOUR_HEIGHT;
        const verticalMinDelta = deltaY * minutesPerPixelY;

        // Combine both deltas for total duration change
        const totalRawDelta = horizontalMinDelta + verticalMinDelta;

        // Snap to grid
        const deltaMin = snapToGrid(totalRawDelta, MINUTE_GRID);

        // Calculate new duration with minimum enforcement
        const newDuration = Math.max(MIN_DURATION, startDuration + deltaMin);
        onDurationChange(item.id, newDuration);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        onResizeStateChange?.(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [item.id, item.durationMin, rowRef, onDurationChange, onResizeStateChange]
  );

  return { isResizing, handleResizeStart };
}
