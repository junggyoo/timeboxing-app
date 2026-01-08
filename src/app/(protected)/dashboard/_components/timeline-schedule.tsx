"use client";

import { useState, useEffect, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { TimeBoxItem } from "@/features/dashboard/types";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { TaskSelectorSheet } from "./task-selector-sheet";

const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const SLOT_HEIGHT = 48; // 30분당 높이 (px)

type TimeSlotProps = {
  time: string;
  onTap?: (time: string) => void;
};

function TimeSlot({ time, onTap }: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `timeline-${time}`,
  });

  const isHour = time.endsWith(":00");

  const handleClick = () => {
    // Only trigger on touch devices (coarse pointer)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      onTap?.(time);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ height: SLOT_HEIGHT }}
      className={cn(
        "group relative flex border-b transition-colors cursor-pointer",
        isOver && "bg-primary/10",
        isHour ? "border-border" : "border-border/30"
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "w-14 shrink-0 py-1 pr-2 text-right text-xs",
          isHour ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {time}
      </div>
      <div className="relative flex-1">
        {isOver ? (
          <div className="flex h-full items-center pl-2 text-xs text-muted-foreground">
            여기에 드롭하세요
          </div>
        ) : (
          /* Mobile tap hint - only visible on touch devices */
          <div className="lg:hidden flex h-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-4 w-4 text-muted-foreground/50" />
          </div>
        )}
      </div>
    </div>
  );
}

// startAt 시간을 기반으로 top 위치 계산
const calculateTopPosition = (startAt: string): number => {
  const [hours, minutes] = startAt.split(":").map(Number);
  const slotIndex = hours * 2 + (minutes >= 30 ? 1 : 0);
  return slotIndex * SLOT_HEIGHT;
};

type TimeBlockProps = {
  item: TimeBoxItem;
};

function TimeBlock({ item }: TimeBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [isResizing, setIsResizing] = useState(false);

  const { editItem, removeItem, updateTimeBlockDuration } = useDashboardStore(
    useShallow((state) => ({
      editItem: state.editItem,
      removeItem: state.removeItem,
      updateTimeBlockDuration: state.updateTimeBlockDuration,
    }))
  );

  // duration 기반 동적 높이 계산
  const height = Math.max(SLOT_HEIGHT, (item.durationMin / 30) * SLOT_HEIGHT);
  // startAt 기반 top 위치 계산
  const top = calculateTopPosition(item.startAt);

  const handleSave = useCallback(() => {
    if (editTitle.trim() && editTitle.trim() !== item.title) {
      editItem("timeBox", item.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  }, [editTitle, editItem, item.id, item.title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        setEditTitle(item.title);
        setIsEditing(false);
      }
    },
    [handleSave, item.title]
  );

  // 리사이즈 핸들러
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startY = e.clientY;
      const startDuration = item.durationMin;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const deltaMin = Math.round(deltaY / SLOT_HEIGHT) * 30;
        const newDuration = Math.max(30, startDuration + deltaMin);
        updateTimeBlockDuration(item.id, newDuration);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [item.id, item.durationMin, updateTimeBlockDuration]
  );

  // title 변경 시 editTitle 동기화
  useEffect(() => {
    setEditTitle(item.title);
  }, [item.title]);

  return (
    <div
      style={{ height, top }}
      className={cn(
        "pointer-events-auto absolute left-0 right-0 overflow-hidden rounded border bg-primary/5 px-2 py-1",
        "group",
        item.status === "done" && "bg-muted opacity-60",
        item.status === "ongoing" && "border-primary bg-primary/10",
        isResizing && "select-none"
      )}
    >
      {isEditing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-6 text-sm"
          autoFocus
        />
      ) : (
        <>
          <div
            className="cursor-pointer"
            onDoubleClick={() => setIsEditing(true)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{item.title}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.startAt} - {item.endAt} ({item.durationMin}분)
            </p>
          </div>

          {/* 편집/삭제 버튼 */}
          <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => removeItem("timeBox", item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}

      {/* 리사이즈 핸들 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize transition-colors",
          "hover:bg-primary/20",
          isResizing && "bg-primary/30"
        )}
        onMouseDown={handleResizeStart}
      />
    </div>
  );
}

export function TimelineSchedule() {
  const items = useDashboardStore(useShallow((state) => state.timeBox));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const handleSlotTap = (time: string) => {
    setSelectedSlot(time);
    setSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setSelectedSlot("");
    }
  };

  return (
    <>
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
          <div className="relative p-2">
            {/* 배경: 시간 슬롯 그리드 (드롭 영역) */}
            {TIME_SLOTS.map((time) => (
              <TimeSlot key={time} time={time} onTap={handleSlotTap} />
            ))}

            {/* 오버레이: 타임박스 아이템들 (absolute positioning) */}
            <div className="pointer-events-none absolute inset-0 left-16 right-2 top-2">
              {items.map((item) => (
                <TimeBlock key={item.id} item={item} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Mobile Task Selector Bottom Sheet */}
      <TaskSelectorSheet
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        targetTime={selectedSlot}
      />
    </>
  );
}
