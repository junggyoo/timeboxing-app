"use client";

import { useState } from "react";
import { useNotToDo } from "../../hooks/use-dashboard";
import { useDashboardStore } from "../../store/dashboard-store";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";
import { QuickScheduleDialog } from "@/app/(protected)/dashboard/_components/quick-schedule-dialog";
import type { BaseItem } from "../../types";

type NotToDoSectionProps = {
  fullHeight?: boolean;
};

export function NotToDoSection({ fullHeight }: NotToDoSectionProps) {
  const { items, add, edit, remove, toggle } = useNotToDo();
  const scheduledIds = useDashboardStore((state) => state.getScheduledSourceIds());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);

  const handleSchedule = (item: BaseItem) => {
    setSelectedItem(item);
    setScheduleDialogOpen(true);
  };

  return (
    <>
      <SectionCard title="Not To-Do" icon="Ban" variant="warning" fullHeight={fullHeight}>
        <QuickAddInput placeholder="오늘 하지 않을 일..." onAdd={add} />
        {items.length === 0 ? (
          <EmptyState message="피해야 할 일을 추가하세요" />
        ) : (
          <ul role="list" className="space-y-1">
            {items.map((item) => (
              <li key={item.id} role="listitem">
                <DraggableItem
                  item={item}
                  section="notToDo"
                  onToggle={() => toggle(item.id)}
                  onEdit={(title) => edit(item.id, title)}
                  onRemove={() => remove(item.id)}
                  variant="inverted"
                  onSchedule={() => handleSchedule(item)}
                  isScheduled={scheduledIds.has(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      <QuickScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        item={selectedItem}
        sourceSection="notToDo"
      />
    </>
  );
}
