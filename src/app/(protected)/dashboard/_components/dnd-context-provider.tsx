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
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ReactNode, useState } from "react";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { DragItemData, ItemSectionKey } from "@/features/dashboard/types";
import { useShallow } from "zustand/react/shallow";

type DndContextProviderProps = {
  children: ReactNode;
};

export function DndContextProvider({ children }: DndContextProviderProps) {
  const [activeItem, setActiveItem] = useState<DragItemData | null>(null);

  const { moveItem, assignToTimeline } = useDashboardStore(
    useShallow((state) => ({
      moveItem: state.moveItem,
      assignToTimeline: state.assignToTimeline,
    }))
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragItemData | undefined;
    if (data) {
      setActiveItem(data);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeData = active.data.current as DragItemData | undefined;
    if (!activeData) return;

    const overId = over.id as string;

    // 타임라인 슬롯에 드롭
    if (overId.startsWith("timeline-")) {
      const time = overId.replace("timeline-", "");
      assignToTimeline(activeData.id, activeData.sourceSection, time);
      return;
    }

    // 섹션에 드롭
    const validSections: ItemSectionKey[] = [
      "brainDump",
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
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeItem && (
          <div className="rounded-md border bg-card px-3 py-2 shadow-lg">
            <p className="text-sm font-medium">{activeItem.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
