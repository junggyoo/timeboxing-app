"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateTimeboxDialog } from "@/app/(protected)/dashboard/_components/create-timebox-dialog";
import { useTimeBox } from "../../hooks/use-dashboard";
import { EmptyState } from "../empty-state";
import { SectionCard } from "../section-card";

export function TimeboxSection() {
  const { items } = useTimeBox();
  const [dialogOpen, setDialogOpen] = useState(false);

  const headerAction = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setDialogOpen(true)}
      className="h-7 text-xs"
    >
      <Plus className="mr-1 h-3 w-3" />
      타임박스 생성
    </Button>
  );

  return (
    <>
      <SectionCard title="Time Box" icon="Clock" headerAction={headerAction}>
        {items.length === 0 ? (
          <EmptyState
            message="타임박스를 추가하여 시간을 관리하세요"
            actionLabel="타임박스 생성"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <ul role="list" className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                role="listitem"
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.startAt} - {item.endAt} · {item.durationMin}분
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <CreateTimeboxDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
