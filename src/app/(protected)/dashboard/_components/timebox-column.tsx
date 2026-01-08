"use client";

import { TimelineSchedule } from "./timeline-schedule";

export function TimeboxColumn() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <TimelineSchedule fullHeight />
    </div>
  );
}
