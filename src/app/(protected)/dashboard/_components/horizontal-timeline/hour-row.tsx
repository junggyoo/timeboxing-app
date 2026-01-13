"use client";

import { useRef, useState, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { HourGridBackground } from "./hour-grid-background";
import { HourBlock } from "./hour-block";
import { HOUR_HEIGHT, TIME_LABEL_WIDTH, ROW_RIGHT_PADDING } from "./constants";
import { getMinuteFromPosition, formatTime } from "./use-block-position";
import { useDragState } from "../drag-state-context";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { useShallow } from "zustand/react/shallow";

type HourRowProps = {
  hour: number;
  items: TimeBoxItem[];
  onCreateTask: (startAt: string, title: string) => void;
};

/**
 * Single hour row in the horizontal timeline.
 * Displays hour label, grid background, and positioned task blocks.
 * Supports click-to-create and drag-drop.
 */
export function HourRow({ hour, items, onCreateTask }: HourRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createMinute, setCreateMinute] = useState(0);
  const [createTitle, setCreateTitle] = useState("");

  // Drag state for pointer tracking
  const { targetHour, targetMinute, isCollision, isDragging, setTargetPosition, wasJustResizing, blockDrag } = useDragState();
  const timeBox = useDashboardStore(useShallow((state) => state.timeBox));

  // Droppable for drag-and-drop from other panels
  const displayHour = hour >= 24 ? hour - 24 : hour;
  const { setNodeRef, isOver } = useDroppable({
    id: `timeline-hour-${displayHour.toString().padStart(2, "0")}`,
  });

  // Track pointer position when dragging over this row
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !rowRef.current) return;
      const rect = rowRef.current.getBoundingClientRect();
      const minute = getMinuteFromPosition(e.clientX, rect.left, rect.width);
      setTargetPosition(hour, minute, timeBox);
    },
    [isDragging, hour, timeBox, setTargetPosition]
  );

  // Check if this row is the current target (for panel drag)
  const isTargetRow = targetHour === hour;

  // Check if this row is the target for block drag
  const isBlockDragTargetRow = blockDrag.blockId !== null && blockDrag.targetHour === hour;

  const prefix = hour >= 24 ? "(+1) " : "";
  const hourLabel = `${prefix}${displayHour.toString().padStart(2, "0")}:00`;

  // Handle click on empty space to create task
  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      if (isCreating) return;
      // Ignore clicks that happen right after a resize operation
      if (wasJustResizing()) return;

      const row = rowRef.current;
      if (!row) return;

      const rect = row.getBoundingClientRect();
      const minute = getMinuteFromPosition(e.clientX, rect.left, rect.width);

      setCreateMinute(minute);
      setIsCreating(true);
    },
    [isCreating, wasJustResizing]
  );

  const handleCreateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && createTitle.trim()) {
      e.preventDefault();
      const startAt = formatTime(hour, createMinute);
      onCreateTask(startAt, createTitle.trim());
      setCreateTitle("");
      setIsCreating(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCreateTitle("");
      setIsCreating(false);
    }
  };

  const handleCreateBlur = () => {
    if (createTitle.trim()) {
      const startAt = formatTime(hour, createMinute);
      onCreateTask(startAt, createTitle.trim());
    }
    setCreateTitle("");
    setIsCreating(false);
  };

  // Calculate position for inline creation input
  const createLeft = (createMinute / 60) * 100;

  return (
    <div
      ref={setNodeRef}
      style={{ height: HOUR_HEIGHT }}
      className="relative flex border-b transition-colors"
      onPointerMove={handlePointerMove}
    >
      {/* Time label */}
      <div
        style={{ width: TIME_LABEL_WIDTH }}
        className="shrink-0 py-2 pr-2 text-right text-xs font-medium text-foreground"
      >
        {hourLabel}
      </div>

      {/* Timeline area - overflow visible to allow resize handles to extend beyond */}
      <div
        className="relative flex-1 overflow-visible"
        style={{ marginRight: ROW_RIGHT_PADDING }}
      >
        {/* Inner container for positioning and click handling */}
        <div
          ref={rowRef}
          className={cn(
            "relative h-full cursor-pointer overflow-visible",
            isCreating && "cursor-text"
          )}
          onClick={handleRowClick}
        >
          {/* Grid background */}
          <HourGridBackground />

          {/* Task blocks */}
          {items.map((item) => (
            <HourBlock key={`${item.id}-${hour}`} item={item} rowHour={hour} rowRef={rowRef} />
          ))}

          {/* Inline creation input */}
          {isCreating && (
            <div
              style={{ left: `${createLeft}%` }}
              className="absolute bottom-1 top-1 z-10 w-32 min-w-[80px]"
            >
              <Input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                onKeyDown={handleCreateKeyDown}
                onBlur={handleCreateBlur}
                placeholder="Task..."
                className="h-full text-xs"
                autoFocus
              />
            </div>
          )}

          {/* Hover hint (hidden when creating or has items) */}
          {!isCreating && items.length === 0 && !isOver && (
            <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
              <Plus className="mr-1 h-3 w-3 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground/50">
                Click to add
              </span>
            </div>
          )}

          {/* Drop slot indicator - shows precise 30-min slot with collision state (for panel drag) */}
          {isOver && isTargetRow && targetMinute !== null && (
            <div
              className={cn(
                "absolute inset-y-1 rounded pointer-events-none transition-all z-5",
                isCollision
                  ? "bg-destructive/20 border border-destructive/50"
                  : "bg-primary/20 border border-primary/50"
              )}
              style={{
                left: `${(targetMinute / 60) * 100}%`,
                width: `${(30 / 60) * 100}%`,
              }}
            />
          )}

          {/* Block drag preview - shows where block will be dropped */}
          {isBlockDragTargetRow && blockDrag.targetMinute !== null && (
            <div
              className={cn(
                "absolute inset-y-1 rounded-md pointer-events-none transition-all z-10",
                "border-2 border-dashed",
                blockDrag.isCollision
                  ? "bg-destructive/20 border-destructive"
                  : "bg-primary/30 border-primary"
              )}
              style={{
                left: `${(blockDrag.targetMinute / 60) * 100}%`,
                width: `${(blockDrag.durationMin / 60) * 100}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
