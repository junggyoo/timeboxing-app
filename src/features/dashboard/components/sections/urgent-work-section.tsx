"use client";

import { useUrgent } from "../../hooks/use-dashboard";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";

export function UrgentWorkSection() {
  const { items, add, edit, remove, toggle } = useUrgent();

  return (
    <SectionCard title="Urgent Work" icon="AlertCircle">
      <QuickAddInput placeholder="긴급 업무 추가..." onAdd={add} />
      {items.length === 0 ? (
        <EmptyState message="긴급한 업무가 없습니다" />
      ) : (
        <ul role="list" className="space-y-1">
          {items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              section="urgent"
              onToggle={() => toggle(item.id)}
              onEdit={(title) => edit(item.id, title)}
              onRemove={() => remove(item.id)}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
