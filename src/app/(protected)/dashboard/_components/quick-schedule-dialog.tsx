"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import type { BaseItem, ItemSectionKey } from "@/features/dashboard/types";

type QuickScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BaseItem | null;
  sourceSection: ItemSectionKey;
};

const DURATION_OPTIONS = [
  { value: "30", label: "30분" },
  { value: "60", label: "1시간" },
  { value: "90", label: "1시간 30분" },
  { value: "120", label: "2시간" },
];

export function QuickScheduleDialog({
  open,
  onOpenChange,
  item,
  sourceSection,
}: QuickScheduleDialogProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const assignToTimeline = useDashboardStore((state) => state.assignToTimeline);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    assignToTimeline(item.id, sourceSection, startTime, Number(duration));
    onOpenChange(false);
    setStartTime("09:00");
    setDuration("30");
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>일정에 추가</DialogTitle>
          <DialogDescription>
            &quot;{item.title}&quot;을(를) 타임박스에 추가합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">시작 시간</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">소요 시간</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="소요 시간 선택" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              추가
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
