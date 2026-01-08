"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBrainDump } from "../../hooks/use-dashboard";
import { EmptyState } from "../empty-state";
import { ItemRow } from "../item-row";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";
import type { ItemSectionKey } from "../../types";

export function BrainDumpSection() {
  const { items, add, edit, remove, toggle, promoteTo } = useBrainDump();

  return (
    <SectionCard title="Brain Dump" icon="Brain">
      <QuickAddInput
        placeholder="생각을 바로 적어 보세요..."
        onAdd={add}
      />
      {items.length === 0 ? (
        <EmptyState message="아이디어를 자유롭게 적어보세요" />
      ) : (
        <ul role="list" className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center">
              <div className="flex-1">
                <ItemRow
                  item={item}
                  onToggle={() => toggle(item.id)}
                  onEdit={(title) => edit(item.id, title)}
                  onRemove={() => remove(item.id)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    aria-label="승격"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => promoteTo(item.id, "priorities" as ItemSectionKey)}
                  >
                    Priorities로 이동
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => promoteTo(item.id, "urgent" as ItemSectionKey)}
                  >
                    Urgent로 이동
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
