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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HorizontalTimeline } from "./horizontal-timeline";
import { DESKTOP_BREAKPOINT } from "./horizontal-timeline/constants";

// Hook for responsive layout detection
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    // Initial check
    checkDesktop();

    // Listen for resize
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop;
}

const SLOT_HEIGHT = 48; // 30분당 높이 (px)
const MAX_END_HOUR = 30; // 최대 종료 시간 (다음 날 06:00까지)

// 시작 시간부터 종료 시간까지의 시간 슬롯 생성
const generateTimeSlots = (startHour: number, endHour: number): string[] => {
  const hoursToDisplay = endHour - startHour;
  const slots: string[] = [];
  for (let i = 0; i < hoursToDisplay; i++) {
    const h = startHour + i;
    const displayHour = h >= 24 ? h - 24 : h;
    const prefix = h >= 24 ? "(+1) " : "";
    slots.push(`${prefix}${displayHour.toString().padStart(2, "0")}:00`);
    slots.push(`${prefix}${displayHour.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

type TimeSlotProps = {
  time: string;
  onTap?: (time: string) => void;
  isCreating?: boolean;
  onStartCreate?: (time: string) => void;
  onCreate?: (time: string, title: string) => void;
  onCancelCreate?: () => void;
};

function TimeSlot({
  time,
  onTap,
  isCreating,
  onStartCreate,
  onCreate,
  onCancelCreate,
}: TimeSlotProps) {
  const [title, setTitle] = useState("");
  const { setNodeRef, isOver } = useDroppable({
    id: `timeline-${time}`,
  });

  const isHour = time.endsWith(":00");

  const handleClick = () => {
    if (typeof window === "undefined") return;

    // Desktop (fine pointer): start inline creation
    if (window.matchMedia("(pointer: fine)").matches) {
      onStartCreate?.(time);
      return;
    }
    // Mobile (coarse pointer): open bottom sheet
    onTap?.(time);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && title.trim()) {
      e.preventDefault();
      onCreate?.(time, title.trim());
      setTitle("");
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitle("");
      onCancelCreate?.();
    }
  };

  const handleBlur = () => {
    if (title.trim()) {
      onCreate?.(time, title.trim());
    }
    setTitle("");
    onCancelCreate?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ height: SLOT_HEIGHT }}
      className={cn(
        "group relative flex border-b transition-colors cursor-pointer",
        isOver && "bg-primary/10",
        isCreating && "bg-primary/5",
        isHour ? "border-border" : "border-border/30"
      )}
      onClick={!isCreating ? handleClick : undefined}
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
        {isCreating ? (
          <div className="flex h-full items-center px-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Task name..."
              className="h-7 text-sm"
              autoFocus
            />
          </div>
        ) : isOver ? (
          <div className="flex h-full items-center pl-2 text-xs text-muted-foreground">
            여기에 드롭하세요
          </div>
        ) : (
          <>
            {/* Desktop hover hint */}
            <div className="hidden lg:flex h-full items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="h-4 w-4 text-muted-foreground/50 mr-1" />
              <span className="text-xs text-muted-foreground/50">Click to add</span>
            </div>
            {/* Mobile tap hint */}
            <div className="lg:hidden flex h-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// startAt 시간을 기반으로 top 위치 계산 (동적 시작 시간 기준)
const calculateTopPosition = (startAt: string, startHour: number): number => {
  const [hours, minutes] = startAt.split(":").map(Number);
  // startHour 기준으로 상대적 위치 계산
  const hoursFromStart = (hours - startHour + 24) % 24;
  const slotIndex = hoursFromStart * 2 + (minutes >= 30 ? 1 : 0);
  return slotIndex * SLOT_HEIGHT;
};

type TimeBlockProps = {
  item: TimeBoxItem;
  startHour: number;
};

function TimeBlock({ item, startHour }: TimeBlockProps) {
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
  // startAt 기반 top 위치 계산 (동적 시작 시간 기준)
  const top = calculateTopPosition(item.startAt, startHour);

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

type TimelineScheduleProps = {
  fullHeight?: boolean;
};

// Calculate end time from start time and duration
const calculateEndTime = (startAt: string, durationMin: number): string => {
  const [hours, minutes] = startAt.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMin;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
};

export function TimelineSchedule({ fullHeight }: TimelineScheduleProps) {
  const isDesktop = useIsDesktop();

  // Render horizontal timeline on desktop, vertical on mobile/tablet
  if (isDesktop) {
    return <HorizontalTimeline fullHeight={fullHeight} />;
  }

  return <VerticalTimeline fullHeight={fullHeight} />;
}

/**
 * Vertical timeline layout for mobile/tablet.
 * Original implementation with 30-minute slots.
 */
function VerticalTimeline({ fullHeight }: TimelineScheduleProps) {
  const { items, addTimeBox } = useDashboardStore(
    useShallow((state) => ({
      items: state.timeBox,
      addTimeBox: state.addTimeBox,
    }))
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [creatingSlot, setCreatingSlot] = useState<string | null>(null);
  const [startHour, setStartHour] = useState(6); // 기본값: 06:00
  const [endHour, setEndHour] = useState(24); // 기본값: 24:00 (자정)

  // 동적 시간 슬롯 생성 (시작 시간부터 종료 시간까지)
  const timeSlots = generateTimeSlots(startHour, endHour);

  // 1시간 추가 가능 여부
  const canExtend = endHour < MAX_END_HOUR;

  // 1시간 추가 핸들러
  const handleExtendHour = () => {
    if (canExtend) {
      setEndHour((prev) => prev + 1);
    }
  };

  // 보이는 시간 범위 내의 아이템만 필터링
  const visibleItems = items.filter((item) => {
    const [hours] = item.startAt.split(":").map(Number);
    // 자정 이후(다음 날)는 24+시간으로 계산
    const normalizedHour = hours < startHour ? hours + 24 : hours;
    return normalizedHour >= startHour && normalizedHour < endHour;
  });

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

  const handleStartCreate = (time: string) => {
    setCreatingSlot(time);
  };

  const handleCreate = (time: string, title: string) => {
    addTimeBox({
      title,
      startAt: time,
      endAt: calculateEndTime(time, 30),
      durationMin: 30,
      status: "scheduled",
    });
    setCreatingSlot(null);
  };

  const handleCancelCreate = () => {
    setCreatingSlot(null);
  };

  return (
    <>
      <Card className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Time Box</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Start at:</span>
            <Select
              value={startHour.toString()}
              onValueChange={(v) => setStartHour(Number(v))}
            >
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {`${i.toString().padStart(2, "0")}:00`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              {items.length}개 일정
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="relative p-2">
            {/* 배경: 시간 슬롯 그리드 (드롭 영역) */}
            {timeSlots.map((time) => (
              <TimeSlot
                key={time}
                time={time}
                onTap={handleSlotTap}
                isCreating={creatingSlot === time}
                onStartCreate={handleStartCreate}
                onCreate={handleCreate}
                onCancelCreate={handleCancelCreate}
              />
            ))}

            {/* 오버레이: 타임박스 아이템들 (absolute positioning) */}
            <div className="pointer-events-none absolute inset-0 left-16 right-2 top-2">
              {visibleItems.map((item) => (
                <TimeBlock key={item.id} item={item} startHour={startHour} />
              ))}
            </div>

            {/* 1시간 추가 버튼 */}
            {canExtend && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-muted-foreground hover:text-foreground"
                onClick={handleExtendHour}
              >
                <Plus className="mr-1 h-4 w-4" />
                1시간 추가
              </Button>
            )}
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
