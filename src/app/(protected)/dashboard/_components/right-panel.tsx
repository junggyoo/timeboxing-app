"use client";

import { MemoSection } from "@/features/dashboard/components/sections";
import { TimelineSchedule } from "./timeline-schedule";

export function RightPanel() {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <TimelineSchedule />
      </div>
      <div className="w-72 shrink-0">
        <MemoSection />
      </div>
    </div>
  );
}
