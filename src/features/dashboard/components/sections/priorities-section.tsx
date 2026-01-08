"use client";

import { Badge } from "@/components/ui/badge";
import { usePriorities } from "../../hooks/use-dashboard";
import { MAX_PRIORITIES } from "../../constants";
import { EmptyState } from "../empty-state";
import { ItemRow } from "../item-row";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";

export function PrioritiesSection() {
  const { items, add, edit, remove, toggle, reorder } = usePriorities();

  const handleAdd = (title: string) => {
    if (items.length >= MAX_PRIORITIES) {
      return;
    }
    add(title);
  };

  const headerAction =
    items.length >= MAX_PRIORITIES ? (
      <Badge variant="secondary" className="text-xs">
        최대 {MAX_PRIORITIES}개
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs">
        {items.length}/{MAX_PRIORITIES}
      </Badge>
    );

  return (
    <SectionCard title="Priorities" icon="Target" headerAction={headerAction}>
      {items.length < MAX_PRIORITIES && (
        <QuickAddInput
          placeholder="오늘의 우선순위 추가..."
          onAdd={handleAdd}
        />
      )}
      {items.length === 0 ? (
        <EmptyState message="오늘 가장 중요한 일을 추가하세요" />
      ) : (
        <ul role="list" className="space-y-1">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="w-5 text-center text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1">
                <ItemRow
                  item={item}
                  onToggle={() => toggle(item.id)}
                  onEdit={(title) => edit(item.id, title)}
                  onRemove={() => remove(item.id)}
                  showReorder
                  onMoveUp={() => reorder(index, index - 1)}
                  onMoveDown={() => reorder(index, index + 1)}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                />
              </div>
            </div>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
