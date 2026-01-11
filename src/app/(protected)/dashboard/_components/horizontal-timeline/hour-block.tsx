"use client";

import { useState, useEffect, useCallback, useMemo, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { useShallow } from "zustand/react/shallow";
import { useBlockPosition } from "./use-block-position";
import { useHorizontalResize } from "./use-horizontal-resize";
import { useHorizontalDrag } from "./use-horizontal-drag";
import { TimelineTooltip } from "./timeline-tooltip";

/**
 * Pastel color palette for task blocks.
 * Colors are designed to be distinct yet harmonious.
 */
const TASK_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700" },
  { bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700" },
  { bg: "bg-pink-100 dark:bg-pink-900/30", border: "border-pink-300 dark:border-pink-700" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", border: "border-cyan-300 dark:border-cyan-700" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-300 dark:border-indigo-700" },
];

/**
 * Get a consistent color for a task based on its ID.
 * Uses hash to ensure same task always gets same color.
 */
function getTaskColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % TASK_COLORS.length;
  return TASK_COLORS[index];
}

type HourBlockProps = {
  item: TimeBoxItem;
  rowHour: number;
  rowRef: RefObject<HTMLDivElement | null>;
};

/**
 * Horizontally positioned task block within an hour row.
 * Supports drag to move start time and resize to change duration.
 * Multi-hour tasks render as visually connected split blocks.
 */
export function HourBlock({ item, rowHour, rowRef }: HourBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const { editItem, removeItem, updateTimeBlockDuration, updateTimeBlockStartTime } =
    useDashboardStore(
      useShallow((state) => ({
        editItem: state.editItem,
        removeItem: state.removeItem,
        updateTimeBlockDuration: state.updateTimeBlockDuration,
        updateTimeBlockStartTime: state.updateTimeBlockStartTime,
      }))
    );

  // Calculate horizontal position
  const { left, width, isStartBlock, isContinuation, continuesNext } =
    useBlockPosition(item, rowHour);

  // Get consistent color for this task
  const taskColor = useMemo(() => getTaskColor(item.id), [item.id]);

  // Horizontal resize hook
  const { isResizing, handleResizeStart } = useHorizontalResize({
    item,
    rowRef,
    onDurationChange: updateTimeBlockDuration,
  });

  // Horizontal drag hook (only for start blocks)
  const { isDragging, wasDraggedRef, handleDragStart } = useHorizontalDrag({
    item,
    rowRef,
    rowHour,
    onStartTimeChange: updateTimeBlockStartTime,
  });

  // Click handler that checks for drag to prevent accidental edit mode
  const handleTitleClick = useCallback(() => {
    if (!wasDraggedRef.current) {
      setIsEditing(true);
    }
  }, [wasDraggedRef]);

  const handleSave = useCallback(() => {
    if (editTitle.trim() && editTitle.trim() !== item.title) {
      editItem("timeBox", item.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  }, [editTitle, editItem, item.id, item.title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        setEditTitle(item.title);
        setIsEditing(false);
      }
    },
    [handleSave, item.title]
  );

  // Sync title when item changes
  useEffect(() => {
    setEditTitle(item.title);
  }, [item.title]);

  // Whether to show resize handle (only when block ends in this row)
  const showResizeHandle = !continuesNext;

  return (
    <TimelineTooltip
      title={item.title}
      startAt={item.startAt}
      endAt={item.endAt}
      durationMin={item.durationMin}
    >
      <div
        style={{
          left: `${left}%`,
          width: `${width}%`,
        }}
        className={cn(
          "group absolute bottom-1 top-1 rounded border-2 px-1.5 py-0.5",
          "transition-colors shadow-sm",
          // Task color based on ID (for visual distinction)
          taskColor.bg,
          taskColor.border,
          // Status styling (overrides default color for done/ongoing)
          item.status === "done" && "bg-muted/80 border-muted-foreground/30 opacity-70",
          item.status === "ongoing" && "border-primary bg-primary/15 ring-1 ring-primary/20",
          // Drag/resize states
          (isResizing || isDragging) && "select-none ring-2 ring-primary/50",
          // Visual connection for multi-hour tasks
          continuesNext && "rounded-r-none border-r-0",
          isContinuation && "rounded-l-none border-l-0",
          // Cursor for draggable blocks
          isStartBlock && !isEditing && "cursor-move"
        )}
        onMouseDown={isStartBlock && !isEditing ? handleDragStart : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content wrapper with overflow hidden */}
        <div className="h-full w-full overflow-hidden">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-5 text-xs"
            autoFocus
          />
        ) : (
          <>
            <div onClick={handleTitleClick}>
              {/* Only show title on start block */}
              {isStartBlock ? (
                <p className="truncate text-xs font-medium leading-tight">
                  {item.title}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">...</p>
              )}
              {/* Show full time range (start - end) if there's enough width */}
              {width > 25 && isStartBlock && (
                <p className="truncate text-[10px] leading-tight text-muted-foreground">
                  {item.startAt} - {item.endAt}
                </p>
              )}
              {/* Show only start time for narrower blocks */}
              {width > 15 && width <= 25 && isStartBlock && (
                <p className="truncate text-[10px] leading-tight text-muted-foreground">
                  {item.startAt}
                </p>
              )}
            </div>

            {/* Edit/Delete buttons - only on start block */}
            {isStartBlock && (
              <div className="absolute right-0.5 top-0.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem("timeBox", item.id);
                  }}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
          </>
        )}
        </div>

        {/* Resize handle - inside the block at right edge */}
        {showResizeHandle && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 -top-0.5 z-20 w-3 cursor-ew-resize",
              "flex items-center justify-center rounded-r",
              "bg-transparent hover:bg-primary/20",
              "opacity-0 transition-all group-hover:opacity-100",
              isResizing && "opacity-100 bg-primary/30"
            )}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleResizeStart(e);
            }}
          >
            {/* Visual grip indicator */}
            <GripVertical className="h-4 w-3 text-muted-foreground/60" />
          </div>
        )}
      </div>
    </TimelineTooltip>
  );
}
