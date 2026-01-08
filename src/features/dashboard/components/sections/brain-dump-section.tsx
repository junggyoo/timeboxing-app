"use client";

import { useState } from "react";
import { useBrainDump } from "../../hooks/use-dashboard";
import { useDashboardStore } from "../../store/dashboard-store";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";
import { QuickScheduleDialog } from "@/app/(protected)/dashboard/_components/quick-schedule-dialog";
import type { BaseItem } from "../../types";

export function BrainDumpSection() {
  const { items, add, edit, remove, toggle } = useBrainDump();
  const scheduledIds = useDashboardStore((state) => state.getScheduledSourceIds());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);

  const handleSchedule = (item: BaseItem) => {
    setSelectedItem(item);
    setScheduleDialogOpen(true);
  };

  return (
    <>
      <SectionCard title="Brain Dump" icon="Brain">
        <QuickAddInput placeholder="생각을 바로 적어 보세요..." onAdd={add} />
        {items.length === 0 ? (
          <EmptyState message="아이디어를 자유롭게 적어보세요" />
        ) : (
          <ul role="list" className="space-y-1">
            {items.map((item) => (
              <li key={item.id} role="listitem">
                <DraggableItem
                  item={item}
                  section="brainDump"
                  onToggle={() => toggle(item.id)}
                  onEdit={(title) => edit(item.id, title)}
                  onRemove={() => remove(item.id)}
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
        sourceSection="brainDump"
      />
    </>
  );
}
