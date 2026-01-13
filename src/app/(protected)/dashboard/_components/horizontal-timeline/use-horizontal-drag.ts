import { useCallback, useState, useRef, type RefObject } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { MINUTE_GRID, MIN_DURATION, HOUR_HEIGHT } from "./constants";
import { snapToGrid } from "./use-block-position";
import { useDragState } from "../drag-state-context";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useShallow } from "zustand/react/shallow";

const DRAG_THRESHOLD = 5; // 5px threshold to distinguish click from drag

// 시간 문자열을 분 단위로 변환
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 분 단위를 시간 문자열로 변환
const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

type UseHorizontalDragOptions = {
  item: TimeBoxItem;
  rowRef: RefObject<HTMLDivElement | null>;
  rowHour: number;
  onStartTimeChange: (id: string, startAt: string) => void;
};

type UseHorizontalDragReturn = {
  isDragging: boolean;
  wasDraggedRef: React.MutableRefObject<boolean>;
  handleDragStart: (e: React.MouseEvent) => void;
};

/**
 * Hook for drag-and-drop functionality supporting both horizontal and vertical movement.
 * - Shows ghost preview at target position during drag
 * - Moves block to target position only on drop
 * Snaps to 10-minute grid intervals.
 */
export function useHorizontalDrag({
  item,
  rowRef,
  rowHour,
  onStartTimeChange,
}: UseHorizontalDragOptions): UseHorizontalDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const wasDraggedRef = useRef(false);

  // Local ref to track target position (avoids React closure issues)
  const dragTargetRef = useRef<{
    hour: number | null;
    minute: number | null;
    isCollision: boolean;
  }>({ hour: null, minute: null, isCollision: false });

  const { startBlockDrag, updateBlockDragTarget, clearBlockDrag } = useDragState();
  const timeBoxRef = useRef<TimeBoxItem[]>([]);
  const timeBox = useDashboardStore(useShallow((state) => state.timeBox));

  // Keep timeBox ref updated
  timeBoxRef.current = timeBox;

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      wasDraggedRef.current = false;
      dragTargetRef.current = { hour: null, minute: null, isCollision: false };

      // Start block drag with initial state
      startBlockDrag(item.id, item.startAt, item.durationMin);

      const rowWidth = rowRef.current?.offsetWidth ?? 1;
      const startX = e.clientX;
      const startY = e.clientY;
      const startTotalMinutes = timeToMinutes(item.startAt);
      const duration = item.durationMin;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Check if movement exceeds threshold to distinguish click from drag
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          wasDraggedRef.current = true;
        }

        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        // 수평 이동: 분 변경 (1시간 = rowWidth 픽셀)
        const minutesPerPixelX = 60 / rowWidth;
        const horizontalMinDelta = deltaX * minutesPerPixelX;

        // 수직 이동: 시간 변경 (1시간 = HOUR_HEIGHT 픽셀)
        // 아래로 드래그(+deltaY) = 나중 시간(+분)
        const minutesPerPixelY = 60 / HOUR_HEIGHT;
        const verticalMinDelta = deltaY * minutesPerPixelY;

        // 수평 + 수직 델타 합산 후 그리드 스냅
        const totalRawDelta = horizontalMinDelta + verticalMinDelta;
        const deltaMin = snapToGrid(totalRawDelta, MINUTE_GRID);

        // 새로운 시작 시간 계산
        const newTotalMinutes = startTotalMinutes + deltaMin;

        // 범위 제한: 00:00 ~ (24:00 - duration)
        const maxStartMinutes = 24 * 60 - duration;
        const clampedMinutes = Math.max(0, Math.min(maxStartMinutes, newTotalMinutes));

        // 그리드 스냅
        const snappedMinutes = snapToGrid(clampedMinutes, MINUTE_GRID);

        // 시간과 분으로 분리
        const targetHour = Math.floor(snappedMinutes / 60);
        const targetMinute = snappedMinutes % 60;

        // Check collision with current timeBox (excluding self)
        const currentTimeBox = timeBoxRef.current;
        const newStartMinutes = targetHour * 60 + targetMinute;
        const newEndMinutes = newStartMinutes + duration;
        const hasCollision = currentTimeBox.some((block) => {
          if (block.id === item.id) return false;
          const existingStart = timeToMinutes(block.startAt);
          const existingEnd = existingStart + block.durationMin;
          return newStartMinutes < existingEnd && newEndMinutes > existingStart;
        });

        // Store in local ref for mouseup
        dragTargetRef.current = {
          hour: targetHour,
          minute: targetMinute,
          isCollision: hasCollision,
        };

        // Update context for UI preview
        updateBlockDragTarget(targetHour, targetMinute, currentTimeBox, item.id);
      };

      const handleMouseUp = () => {
        // Read final target from local ref (not from context)
        const { hour, minute, isCollision } = dragTargetRef.current;

        // Only move if actually dragged and no collision
        if (wasDraggedRef.current && hour !== null && minute !== null && !isCollision) {
          const newStartAt = minutesToTime(hour * 60 + minute);
          onStartTimeChange(item.id, newStartAt);
        }

        // Cleanup
        setIsDragging(false);
        clearBlockDrag();
        dragTargetRef.current = { hour: null, minute: null, isCollision: false };
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // Delay reset so click handler can check wasDraggedRef
        setTimeout(() => {
          wasDraggedRef.current = false;
        }, 100);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [item.id, item.startAt, item.durationMin, rowRef, onStartTimeChange, startBlockDrag, updateBlockDragTarget, clearBlockDrag]
  );

  return { isDragging, wasDraggedRef, handleDragStart };
}
