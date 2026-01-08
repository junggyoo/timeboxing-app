"use client";

import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { TimeBoxItem, TimeBoxStatus } from "@/features/dashboard/types";
import { Clock } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const STATUS_VARIANT: Record<TimeBoxStatus, "default" | "secondary" | "outline"> = {
  ongoing: "default",
  done: "secondary",
  scheduled: "outline",
};

const STATUS_LABEL: Record<TimeBoxStatus, string> = {
  ongoing: "진행중",
  done: "완료",
  scheduled: "예정",
};

type TimeSlotProps = {
  time: string;
  items: TimeBoxItem[];
};

function TimeSlot({ time, items }: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `timeline-${time}`,
  });

  const slotItems = items.filter((item) => item.startAt === time);
  const isHour = time.endsWith(":00");

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative flex min-h-[40px] border-b transition-colors",
        isOver && "bg-primary/10",
        isHour ? "border-border" : "border-border/30"
      )}
    >
      <div
        className={cn(
          "w-14 shrink-0 py-1 pr-2 text-right text-xs",
          isHour ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {time}
      </div>
      <div className="relative flex-1 py-1 pl-2">
        {slotItems.map((item) => (
          <TimeBlock key={item.id} item={item} />
        ))}
        {slotItems.length === 0 && isOver && (
          <div className="flex h-full items-center text-xs text-muted-foreground">
            여기에 드롭하세요
          </div>
        )}
      </div>
    </div>
  );
}

type TimeBlockProps = {
  item: TimeBoxItem;
};

function TimeBlock({ item }: TimeBlockProps) {
  return (
    <div
      className={cn(
        "mb-1 rounded border bg-primary/5 px-2 py-1",
        item.status === "done" && "bg-muted opacity-60",
        item.status === "ongoing" && "border-primary bg-primary/10"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <Badge variant={STATUS_VARIANT[item.status]} className="shrink-0 text-xs">
          {STATUS_LABEL[item.status]}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {item.startAt} - {item.endAt} ({item.durationMin}분)
      </p>
    </div>
  );
}

export function TimelineSchedule() {
  const items = useDashboardStore(useShallow((state) => state.timeBox));

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Time Box</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {items.length}개 일정
        </Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {TIME_SLOTS.map((time) => (
            <TimeSlot key={time} time={time} items={items} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
