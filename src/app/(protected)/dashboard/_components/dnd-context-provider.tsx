"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ReactNode, useState, useCallback } from "react";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { DragItemData, ItemSectionKey } from "@/features/dashboard/types";
import { useShallow } from "zustand/react/shallow";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { DragStateProvider, useDragState } from "./drag-state-context";
import { BlockDragGhost } from "./horizontal-timeline/block-drag-ghost";

type DndContextProviderProps = {
  children: ReactNode;
};

type ActiveItemState = DragItemData & {
  width?: number;
};

// Trigger shake animation on an element by ID
function triggerShakeAnimation(itemId: string) {
  const element = document.querySelector(`[data-item-id="${itemId}"]`);
  if (element) {
    element.classList.add("animate-shake");
    setTimeout(() => element.classList.remove("animate-shake"), 600);
  }
}

// Inner component that uses the drag state context
function DndContextInner({ children }: DndContextProviderProps) {
  const [activeItem, setActiveItem] = useState<ActiveItemState | null>(null);

  const { moveItem, assignToTimeline } = useDashboardStore(
    useShallow((state) => ({
      moveItem: state.moveItem,
      assignToTimeline: state.assignToTimeline,
    }))
  );

  const { targetMinute, isCollision, clearTarget, setIsDragging } = useDragState();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DragItemData | undefined;
      if (data) {
        const rect = event.active.rect.current.translated;
        const width = rect ? rect.width : undefined;
        setActiveItem({ ...data, width });
        setIsDragging(true);
      }
    },
    [setIsDragging]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const currentTargetMinute = targetMinute;
      const currentIsCollision = isCollision;

      // Clear drag state
      clearTarget();
      setIsDragging(false);
      setActiveItem(null);

      if (!over) return;

      const activeData = active.data.current as DragItemData | undefined;
      if (!activeData) return;

      const overId = over.id as string;

      // 수평 타임라인 (시간 단위) 드롭 - timeline-hour-HH 형식
      if (overId.startsWith("timeline-hour-")) {
        const hour = overId.replace("timeline-hour-", "");
        // Use tracked minute from context (snapped to 10-min grid)
        const minute = currentTargetMinute ?? 0;
        const time = `${hour}:${minute.toString().padStart(2, "0")}`;

        // If collision was detected, reject with shake animation
        if (currentIsCollision) {
          triggerShakeAnimation(activeData.id);
          return;
        }

        assignToTimeline(activeData.id, activeData.sourceSection, time, 30);
        return;
      }

      // 수직 타임라인 슬롯에 드롭 - timeline-HH:MM 형식
      if (overId.startsWith("timeline-")) {
        const time = overId.replace("timeline-", "");
        assignToTimeline(activeData.id, activeData.sourceSection, time);
        return;
      }

      // 섹션에 드롭
      const validSections: ItemSectionKey[] = [
        "priorities",
        "urgent",
        "selfDev",
        "notToDo",
      ];

      if (
        validSections.includes(overId as ItemSectionKey) &&
        overId !== activeData.sourceSection
      ) {
        moveItem(
          activeData.sourceSection,
          overId as ItemSectionKey,
          activeData.id
        );
      }
    },
    [targetMinute, isCollision, clearTarget, setIsDragging, assignToTimeline, moveItem]
  );

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      clearTarget();
      setIsDragging(false);
      setActiveItem(null);
    },
    [clearTarget, setIsDragging]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeItem && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 shadow-lg transition-colors",
              isCollision
                ? "bg-destructive/10 border-destructive"
                : "bg-card"
            )}
            style={{ width: activeItem.width, minWidth: 200 }}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="truncate text-sm font-medium">{activeItem.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Wrapper that provides the drag state context
export function DndContextProvider({ children }: DndContextProviderProps) {
  return (
    <DragStateProvider>
      <DndContextInner>{children}</DndContextInner>
      <BlockDragGhost />
    </DragStateProvider>
  );
}
