"use client";

import { useSelfDev } from "../../hooks/use-dashboard";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";

export function SelfDevSection() {
  const { items, add, edit, remove, toggle } = useSelfDev();

  const handleAdd = (value: string) => {
    const tagMatch = value.match(/#\w+/g);
    const tags = tagMatch ?? undefined;
    const title = value.replace(/#\w+/g, "").trim();

    if (title) {
      add(title, tags);
    }
  };

  return (
    <SectionCard title="Self-Development" icon="Lightbulb">
      <QuickAddInput
        placeholder="자기 계발 항목 추가... (#reading, #coding)"
        onAdd={handleAdd}
      />
      {items.length === 0 ? (
        <EmptyState message="자기 계발 목표를 추가하세요" />
      ) : (
        <ul role="list" className="space-y-1">
          {items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              section="selfDev"
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
