"use client";

import { useNotToDo } from "../../hooks/use-dashboard";
import { EmptyState } from "../empty-state";
import { ItemRow } from "../item-row";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";

export function NotToDoSection() {
  const { items, add, edit, remove, toggle } = useNotToDo();

  return (
    <SectionCard title="Not To-Do" icon="Ban">
      <QuickAddInput placeholder="오늘 하지 않을 일..." onAdd={add} />
      {items.length === 0 ? (
        <EmptyState message="피해야 할 일을 추가하세요" />
      ) : (
        <ul role="list" className="space-y-1">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => toggle(item.id)}
              onEdit={(title) => edit(item.id, title)}
              onRemove={() => remove(item.id)}
              variant="inverted"
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
