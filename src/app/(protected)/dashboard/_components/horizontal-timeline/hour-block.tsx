"use client";

import { useState, useEffect, useCallback, useMemo, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical, Play, Pause } from "lucide-react";
import { useTimerActions } from "@/features/timer";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { useShallow } from "zustand/react/shallow";
import { useBlockPosition } from "./use-block-position";
import { useHorizontalResize } from "./use-horizontal-resize";
import { useHorizontalLeftResize } from "./use-horizontal-left-resize";
import { useHorizontalDrag } from "./use-horizontal-drag";
import { TimelineTooltip } from "./timeline-tooltip";
import { useDragState } from "../drag-state-context";
import { getTaskColorByIndex, TASK_COLORS } from "@/features/dashboard/utils/color-utils";

/**
 * Fallback: Get a consistent color for a task based on its ID (for legacy tasks without colorIndex).
 * Uses hash to ensure same task always gets same color.
 */
function getTaskColorByHash(id: string) {
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
  const [isHovered, setIsHovered] = useState(false);

  // Timer state and actions from provider (FSM-based)
  const { timeboxId, status, start, pause, resume } = useTimerActions();

  const isTimerActiveForThis = timeboxId === item.id;
  const isTimerRunning = isTimerActiveForThis && status === "running";
  const isTimerPaused = isTimerActiveForThis && status === "paused";

  const { editItem, removeItem, updateTimeBlockDuration, updateTimeBlockStartTime, updateTimeBlockLeftResize } =
    useDashboardStore(
      useShallow((state) => ({
        editItem: state.editItem,
        removeItem: state.removeItem,
        updateTimeBlockDuration: state.updateTimeBlockDuration,
        updateTimeBlockStartTime: state.updateTimeBlockStartTime,
        updateTimeBlockLeftResize: state.updateTimeBlockLeftResize,
      }))
    );

  // Get resize state and block drag state from context
  const { setIsResizing, blockDrag } = useDragState();

  // Check if this block is currently being dragged
  const isBeingDragged = blockDrag.blockId === item.id;

  // Calculate horizontal position
  const { left, width, isStartBlock, isContinuation, continuesNext } =
    useBlockPosition(item, rowHour);

  // Get color for this task - use stored colorIndex if available, otherwise fallback to hash-based
  const taskColor = useMemo(() => {
    if (item.colorIndex !== undefined) {
      return getTaskColorByIndex(item.colorIndex);
    }
    return getTaskColorByHash(item.id);
  }, [item.id, item.colorIndex]);

  // Horizontal resize hook (right side)
  const { isResizing, handleResizeStart } = useHorizontalResize({
    item,
    rowRef,
    onDurationChange: updateTimeBlockDuration,
    onResizeStateChange: setIsResizing,
  });

  // Horizontal left resize hook (left side)
  const { isLeftResizing, handleLeftResizeStart } = useHorizontalLeftResize({
    item,
    rowRef,
    onLeftResize: updateTimeBlockLeftResize,
    onResizeStateChange: setIsResizing,
  });

  // Ghost data for drag visualization (title and color, dimensions calculated at drag start)
  const ghostData = useMemo(
    () => ({
      title: item.title,
      color: taskColor,
    }),
    [item.title, taskColor]
  );

  // Horizontal drag hook (only for start blocks)
  const { isDragging, wasDraggedRef, handleDragStart } = useHorizontalDrag({
    item,
    rowRef,
    rowHour,
    onStartTimeChange: updateTimeBlockStartTime,
    ghostData,
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

  // Whether to show resize handles
  const showResizeHandle = !continuesNext; // Right handle: only when block ends in this row
  const showLeftResizeHandle = isStartBlock; // Left handle: only on start blocks

  // Timer control handlers
  const handlePlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isTimerRunning) {
        pause();
      } else if (isTimerPaused) {
        resume();
      } else {
        // Start new timer
        start(item.id, item.title, item.durationMin);
      }
    },
    [item.id, item.title, item.durationMin, start, pause, resume, isTimerRunning, isTimerPaused]
  );

  // Determine if we should show the play button outside the block (for narrow blocks)
  // Narrow = less than 30 minutes (50% width = 30 min in 1-hour row)
  const isNarrowBlock = width < 50;

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
          // Hover elevation: boost z-index when hovered to bring block and floating buttons to front
          zIndex: isHovered || isResizing || isLeftResizing || isDragging ? 50 : 1,
        }}
        className={cn(
          "group absolute bottom-1 top-1 rounded border-2 px-1.5 py-0.5",
          "transition-all shadow-sm",
          // Task color based on ID (for visual distinction)
          taskColor.bg,
          taskColor.border,
          // Status styling (only for done - ongoing style is handled by timer states)
          item.status === "done" && "bg-muted/80 border-muted-foreground/30 opacity-70",
          // Timer running state - thick blue border with subtle pulse animation
          isTimerRunning && "border-primary border-[3px] shadow-md shadow-primary/20 animate-pulse",
          // Timer paused state - amber border
          isTimerPaused && "border-amber-500 border-[3px] shadow-md shadow-amber-500/20",
          // Drag/resize states
          (isResizing || isLeftResizing || isDragging) && "select-none ring-2 ring-primary/50",
          // Block being dragged - show as semi-transparent ghost at original position
          isBeingDragged && "opacity-40 border-dashed",
          // Visual connection for multi-hour tasks
          continuesNext && "rounded-r-none border-r-0",
          isContinuation && "rounded-l-none border-l-0",
          // Cursor for draggable blocks
          isStartBlock && !isEditing && "cursor-move"
        )}
        onMouseDown={isStartBlock && !isEditing ? handleDragStart : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content wrapper with overflow hidden - strictly enforce boundaries */}
        <div className="relative h-full w-full overflow-hidden">
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
            {/* Text content */}
            <div onClick={handleTitleClick}>
              {/* Only show title on start block */}
              {isStartBlock ? (
                <p className="truncate text-xs font-medium leading-tight flex items-center gap-1">
                  {/* Small running indicator dot */}
                  {isTimerRunning && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  )}
                  {isTimerPaused && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{item.title}</span>
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

            {/* Action buttons for WIDE blocks - positioned at top-right corner */}
            {isStartBlock && !isNarrowBlock && (
              <div className={cn(
                "absolute right-0 top-0 flex gap-0.5 rounded px-0.5 py-0.5",
                // Background for visibility
                "bg-background/90 dark:bg-background/90",
                "shadow-[0_0_4px_rgba(0,0,0,0.1)] dark:shadow-[0_0_4px_rgba(0,0,0,0.3)]",
                // Hover-only visibility with grace period
                "opacity-0 invisible transition-all duration-150",
                "[transition-delay:150ms]",
                "group-hover:opacity-100 group-hover:visible group-hover:[transition-delay:0ms]"
              )}>
                {item.status !== "done" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-5 w-5",
                      isTimerRunning && "text-primary",
                      isTimerPaused && "text-amber-500"
                    )}
                    onClick={handlePlayClick}
                  >
                    {isTimerRunning ? (
                      <Pause className="h-2.5 w-2.5" />
                    ) : (
                      <Play className="h-2.5 w-2.5" />
                    )}
                  </Button>
                )}
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

            {/* Action buttons for NARROW blocks - same positioning as wide blocks */}
            {isStartBlock && isNarrowBlock && (
              <div className={cn(
                "absolute right-0 top-0 flex gap-0.5 rounded px-0.5 py-0.5",
                // Background for visibility
                "bg-background/90 dark:bg-background/90",
                "shadow-[0_0_4px_rgba(0,0,0,0.1)] dark:shadow-[0_0_4px_rgba(0,0,0,0.3)]",
                // Hover-only visibility with grace period
                "opacity-0 invisible transition-all duration-150",
                "[transition-delay:150ms]",
                "group-hover:opacity-100 group-hover:visible group-hover:[transition-delay:0ms]"
              )}>
                {item.status !== "done" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-5 w-5",
                      isTimerRunning && "text-primary",
                      isTimerPaused && "text-amber-500"
                    )}
                    onClick={handlePlayClick}
                  >
                    {isTimerRunning ? (
                      <Pause className="h-2.5 w-2.5" />
                    ) : (
                      <Play className="h-2.5 w-2.5" />
                    )}
                  </Button>
                )}
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

        {/* Left resize handle - inside the block at left edge */}
        {showLeftResizeHandle && (
          <div
            className={cn(
              "absolute -bottom-0.5 -left-0.5 -top-0.5 z-20 w-3 cursor-ew-resize",
              "flex items-center justify-center rounded-l",
              "bg-transparent hover:bg-primary/20",
              "opacity-0 transition-all group-hover:opacity-100",
              isLeftResizing && "opacity-100 bg-primary/30"
            )}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleLeftResizeStart(e);
            }}
          >
            {/* Visual grip indicator */}
            <GripVertical className="h-4 w-3 text-muted-foreground/60" />
          </div>
        )}

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
