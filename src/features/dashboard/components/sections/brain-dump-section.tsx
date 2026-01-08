"use client";

import { useBrainDump } from "../../hooks/use-dashboard";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";

export function BrainDumpSection() {
  const { items, add, edit, remove, toggle } = useBrainDump();

  return (
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
              />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
