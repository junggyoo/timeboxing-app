"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DashboardGrid } from "./dashboard-grid";
import { MobileSectionList } from "./mobile-section-list";

export function DashboardView() {
  const today = new Date();
  const formattedDate = format(today, "yyyy년 M월 d일 EEEE", { locale: ko });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <DashboardGrid />
      <MobileSectionList />
    </div>
  );
}
