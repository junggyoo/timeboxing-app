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
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";

type CreateTimeboxDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormErrors = {
  title?: string;
  startTime?: string;
  endTime?: string;
};

export function CreateTimeboxDialog({
  open,
  onOpenChange,
}: CreateTimeboxDialogProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const addTimeBox = useDashboardStore((state) => state.addTimeBox);

  const handleReset = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    }

    if (!startTime) {
      newErrors.startTime = "시작 시간을 입력해주세요.";
    }

    if (!endTime) {
      newErrors.endTime = "종료 시간을 입력해주세요.";
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "종료 시간은 시작 시간보다 이후여야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const durationMin = (endH * 60 + endM) - (startH * 60 + startM);

    addTimeBox({
      title: title.trim(),
      startAt: startTime,
      endAt: endTime,
      durationMin,
      status: "scheduled",
    });

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 타임박스 생성</DialogTitle>
          <DialogDescription>집중할 작업을 계획하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              type="text"
              placeholder="예: 기획서 초안 작성"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">시작 시간</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && (
                <p className="text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">종료 시간</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={errors.endTime ? "border-red-500" : ""}
              />
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
