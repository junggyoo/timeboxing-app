"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { BaseItem, ItemSectionKey } from "../types";
import { ItemRow } from "./item-row";
import { Button } from "@/components/ui/button";
import { GripVertical, CalendarPlus } from "lucide-react";

type DraggableItemProps = {
  item: BaseItem;
  section: ItemSectionKey;
  onToggle: () => void;
  onEdit: (title: string) => void;
  onRemove: () => void;
  variant?: "normal" | "inverted";
  showReorder?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  onSchedule?: () => void;
  isScheduled?: boolean;
};

export function DraggableItem({
  item,
  section,
  onToggle,
  onEdit,
  onRemove,
  variant = "normal",
  showReorder,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onSchedule,
  isScheduled = false,
}: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: {
      id: item.id,
      title: item.title,
      sourceSection: section,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-item-id={item.id}
      className={cn(
        "group flex items-center gap-1",
        isDragging && "opacity-50"
      )}
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab touch-none rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 active:cursor-grabbing"
        aria-label="드래그하여 이동"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <ItemRow
          item={item}
          onToggle={onToggle}
          onEdit={onEdit}
          onRemove={onRemove}
          variant={variant}
          showReorder={showReorder}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={isFirst}
          isLast={isLast}
          isScheduled={isScheduled}
        />
      </div>
      {onSchedule && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onSchedule}
          aria-label="일정에 추가"
        >
          <CalendarPlus className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
