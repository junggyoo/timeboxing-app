"use client";

import { MemoSection } from "@/features/dashboard/components/sections";
import { TimelineSchedule } from "./timeline-schedule";

export function RightPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1">
        <TimelineSchedule />
      </div>
      <MemoSection />
    </div>
  );
}
