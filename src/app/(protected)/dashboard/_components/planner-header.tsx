"use client";

import { Input } from "@/components/ui/input";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Target } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

export function PlannerHeader() {
  const { selectedDate, goal, setSelectedDate, setGoal } = useDashboardStore(
    useShallow((state) => ({
      selectedDate: state.selectedDate,
      goal: state.goal,
      setSelectedDate: state.setSelectedDate,
      setGoal: state.setGoal,
    }))
  );

  const formattedDate = format(new Date(selectedDate), "yyyy년 M월 d일 EEEE", {
    locale: ko,
  });

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">오늘의 날짜</p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-lg font-semibold outline-none"
          />
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-3 sm:max-w-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10">
          <Target className="h-5 w-5 text-secondary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">오늘의 목표</p>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="오늘 가장 중요한 목표를 적어보세요..."
            className="border-0 bg-transparent p-0 text-base font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
