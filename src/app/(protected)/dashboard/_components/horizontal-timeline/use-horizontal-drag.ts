import { useCallback, useState, useRef, type RefObject } from "react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { MINUTE_GRID, HOUR_HEIGHT } from "./constants";
import { snapToGrid } from "./use-block-position";
import { useDragState, type GhostDataInput } from "../drag-state-context";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useShallow } from "zustand/react/shallow";
import { dispatchGhostMove } from "./block-drag-ghost";

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
  // Ghost data for lift & drop visual feedback (dimensions calculated at drag start)
  ghostData?: GhostDataInput;
};

type UseHorizontalDragReturn = {
  isDragging: boolean;
  wasDraggedRef: React.MutableRefObject<boolean>;
  handleDragStart: (e: React.MouseEvent) => void;
};

/**
 * Hook for drag-and-drop functionality supporting both horizontal and vertical movement.
 * Implements "Lift & Drop" UX:
 * - Original block stays in place (reduced opacity)
 * - Ghost element follows cursor freely
 * - Preview shows target position
 * - Data updates only on drop
 * Snaps to 10-minute grid intervals.
 */
export function useHorizontalDrag({
  item,
  rowRef,
  rowHour,
  onStartTimeChange,
  ghostData,
}: UseHorizontalDragOptions): UseHorizontalDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const wasDraggedRef = useRef(false);

  // Local ref to track target position (avoids React closure issues)
  const dragTargetRef = useRef<{
    hour: number | null;
    minute: number | null;
    isCollision: boolean;
  }>({ hour: null, minute: null, isCollision: false });

  // Ref to store cursor offset for ghost positioning
  const cursorOffsetRef = useRef({ x: 0, y: 0 });

  const { startBlockDrag, startBlockDragWithGhost, updateBlockDragTarget, clearBlockDrag } = useDragState();
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

      // Calculate cursor offset from element origin for ghost positioning
      const rect = e.currentTarget.getBoundingClientRect();
      cursorOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Start block drag with ghost data if provided
      if (ghostData) {
        // Calculate full ghost data with dimensions from the element
        const fullGhostData = {
          ...ghostData,
          width: rect.width,
          height: rect.height,
        };
        startBlockDragWithGhost(
          item.id,
          item.startAt,
          item.durationMin,
          fullGhostData,
          cursorOffsetRef.current
        );
        // Initialize ghost position
        dispatchGhostMove(
          e.clientX - cursorOffsetRef.current.x,
          e.clientY - cursorOffsetRef.current.y
        );
      } else {
        startBlockDrag(item.id, item.startAt, item.durationMin);
      }

      // Capture row dimensions for coordinate calculations
      const rowRect = rowRef.current?.getBoundingClientRect();
      const rowWidth = rowRect?.width ?? 1;
      const rowLeft = rowRect?.left ?? 0;

      // Capture starting state
      const startX = e.clientX;
      const startY = e.clientY;
      const startHour = Math.floor(timeToMinutes(item.startAt) / 60);
      const startMinute = timeToMinutes(item.startAt) % 60;
      const duration = item.durationMin;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Check if movement exceeds threshold to distinguish click from drag
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          wasDraggedRef.current = true;
        }

        // Update ghost position (bypasses React state for smooth updates)
        if (ghostData) {
          dispatchGhostMove(
            moveEvent.clientX - cursorOffsetRef.current.x,
            moveEvent.clientY - cursorOffsetRef.current.y
          );
        }

        const deltaY = moveEvent.clientY - startY;

        // === INDEPENDENT X/Y CALCULATIONS ===

        // 1. HOUR: Calculate from Y delta only (vertical movement)
        // Round to snap to nearest row
        const hourDelta = Math.round(deltaY / HOUR_HEIGHT);
        let targetHour = startHour + hourDelta;

        // 2. MINUTE: Calculate from absolute X position (horizontal position)
        // Use cursor X relative to row, independent of Y movement
        const cursorX = moveEvent.clientX;
        const relativeX = cursorX - rowLeft;
        const percentX = Math.max(0, Math.min(1, relativeX / rowWidth));
        const rawMinute = percentX * 60;
        let targetMinute = snapToGrid(rawMinute, MINUTE_GRID);

        // 3. Clamp minute to valid range (0-50 for 10-min grid with standard blocks)
        targetMinute = Math.max(0, Math.min(50, targetMinute));

        // 4. Clamp hour to valid range and ensure block doesn't extend past 24:00
        const maxStartMinutes = 24 * 60 - duration;
        let totalMinutes = targetHour * 60 + targetMinute;

        // Clamp total time to valid range
        totalMinutes = Math.max(0, Math.min(maxStartMinutes, totalMinutes));

        // Recalculate hour and minute after clamping
        targetHour = Math.floor(totalMinutes / 60);
        targetMinute = snapToGrid(totalMinutes % 60, MINUTE_GRID);

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
    [item.id, item.startAt, item.durationMin, rowRef, onStartTimeChange, ghostData, startBlockDrag, startBlockDragWithGhost, updateBlockDragTarget, clearBlockDrag]
  );

  return { isDragging, wasDraggedRef, handleDragStart };
}
