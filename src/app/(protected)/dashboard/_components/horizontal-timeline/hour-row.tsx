"use client";

import { useRef, useState, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { HourGridBackground } from "./hour-grid-background";
import { HourBlock } from "./hour-block";
import { HOUR_HEIGHT, TIME_LABEL_WIDTH, MINUTE_GRID, ROW_RIGHT_PADDING } from "./constants";
import { getMinuteFromPosition, formatTime, calculateEndTime } from "./use-block-position";

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

  // Droppable for drag-and-drop from other panels
  const displayHour = hour >= 24 ? hour - 24 : hour;
  const { setNodeRef, isOver } = useDroppable({
    id: `timeline-hour-${displayHour.toString().padStart(2, "0")}`,
  });

  const prefix = hour >= 24 ? "(+1) " : "";
  const hourLabel = `${prefix}${displayHour.toString().padStart(2, "0")}:00`;

  // Handle click on empty space to create task
  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      if (isCreating) return;

      const row = rowRef.current;
      if (!row) return;

      const rect = row.getBoundingClientRect();
      const minute = getMinuteFromPosition(e.clientX, rect.left, rect.width);

      setCreateMinute(minute);
      setIsCreating(true);
    },
    [isCreating]
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
      className={cn(
        "relative flex border-b transition-colors",
        isOver && "bg-primary/10"
      )}
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
          {!isCreating && items.length === 0 && (
            <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
              <Plus className="mr-1 h-3 w-3 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground/50">
                Click to add
              </span>
            </div>
          )}

          {/* Drop hint */}
          {isOver && (
            <div className="flex h-full items-center pl-2 text-xs text-muted-foreground">
              Drop here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
