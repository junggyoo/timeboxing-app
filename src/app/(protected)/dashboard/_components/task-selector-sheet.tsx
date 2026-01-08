"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { Brain, Clock, Sparkles, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BaseItem, ItemSectionKey } from "@/features/dashboard/types";
import { useShallow } from "zustand/react/shallow";

type TaskSelectorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTime: string;
};

type SectionConfig = {
  key: ItemSectionKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SECTIONS: SectionConfig[] = [
  { key: "brainDump", title: "Brain Dump", icon: Brain },
  { key: "priorities", title: "Priorities", icon: Target },
  { key: "urgent", title: "Urgent Work", icon: Zap },
  { key: "selfDev", title: "Self Development", icon: Sparkles },
];

type TaskItemProps = {
  item: BaseItem;
  isScheduled: boolean;
  onSelect: () => void;
};

function TaskItem({ item, isScheduled, onSelect }: TaskItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/50 active:bg-muted",
        item.isDone && "opacity-50"
      )}
    >
      {isScheduled && (
        <Clock className="h-4 w-4 shrink-0 text-primary" />
      )}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          item.isDone && "line-through text-muted-foreground"
        )}
      >
        {item.title}
      </span>
    </button>
  );
}

type SectionGroupProps = {
  config: SectionConfig;
  items: BaseItem[];
  scheduledIds: Set<string>;
  onSelectTask: (itemId: string, section: ItemSectionKey) => void;
};

function SectionGroup({ config, items, scheduledIds, onSelectTask }: SectionGroupProps) {
  const Icon = config.icon;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {config.title}
        </span>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <TaskItem
            key={item.id}
            item={item}
            isScheduled={scheduledIds.has(item.id)}
            onSelect={() => onSelectTask(item.id, config.key)}
          />
        ))}
      </div>
    </div>
  );
}

export function TaskSelectorSheet({
  open,
  onOpenChange,
  targetTime,
}: TaskSelectorSheetProps) {
  const { brainDump, priorities, urgent, selfDev, assignToTimeline, getScheduledSourceIds } =
    useDashboardStore(
      useShallow((state) => ({
        brainDump: state.brainDump,
        priorities: state.priorities,
        urgent: state.urgent,
        selfDev: state.selfDev,
        assignToTimeline: state.assignToTimeline,
        getScheduledSourceIds: state.getScheduledSourceIds,
      }))
    );

  const scheduledIds = getScheduledSourceIds();

  const sectionData: Record<ItemSectionKey, BaseItem[]> = {
    brainDump,
    priorities,
    urgent,
    selfDev,
    notToDo: [], // Exclude notToDo section
  };

  const handleSelectTask = (itemId: string, section: ItemSectionKey) => {
    assignToTimeline(itemId, section, targetTime, 30);
    onOpenChange(false);
  };

  const totalTasks = brainDump.length + priorities.length + urgent.length + selfDev.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[70vh] rounded-t-2xl px-0"
      >
        <SheetHeader className="px-6 pb-4 border-b">
          <SheetTitle>할 일 선택</SheetTitle>
          <SheetDescription>
            {targetTime}에 추가할 할 일을 선택하세요
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(70vh-100px)]">
          <div className="space-y-4 py-4">
            {totalTasks === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  할 일이 없습니다.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Planning 탭에서 할 일을 추가해주세요.
                </p>
              </div>
            ) : (
              SECTIONS.map((config) => (
                <SectionGroup
                  key={config.key}
                  config={config}
                  items={sectionData[config.key]}
                  scheduledIds={scheduledIds}
                  onSelectTask={handleSelectTask}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
