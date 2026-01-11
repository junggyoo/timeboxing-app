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
import { GripVertical } from "lucide-react";

type DndContextProviderProps = {
  children: ReactNode;
};

type ActiveItemState = DragItemData & {
  width?: number;
};

export function DndContextProvider({ children }: DndContextProviderProps) {
  const [activeItem, setActiveItem] = useState<ActiveItemState | null>(null);

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
      // event.active.rect.current.translated를 통해 드래그 요소 정보 접근
      const rect = event.active.rect.current.translated;
      const width = rect ? rect.width : undefined;
      setActiveItem({ ...data, width });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeData = active.data.current as DragItemData | undefined;
    if (!activeData) return;

    const overId = over.id as string;

    // 수평 타임라인 (시간 단위) 드롭 - timeline-hour-HH 형식
    if (overId.startsWith("timeline-hour-")) {
      const hour = overId.replace("timeline-hour-", "");
      const time = `${hour}:00`;
      assignToTimeline(activeData.id, activeData.sourceSection, time);
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
      <DragOverlay dropAnimation={null}>
        {activeItem && (
          <div
            className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 shadow-lg"
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
