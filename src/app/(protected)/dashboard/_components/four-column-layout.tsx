"use client";

import { BrainDumpColumn } from "./brain-dump-column";
import { ListsColumn } from "./lists-column";
import { MemoColumn } from "./memo-column";
import { PlannerHeader } from "./planner-header";
import { TimeboxColumn } from "./timebox-column";

export function FourColumnLayout() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Planner Header - spans full width */}
      <div className="shrink-0 border-b bg-card px-4 py-3">
        <PlannerHeader />
      </div>

      {/* 4-Column Grid - fills remaining height */}
      <div className="grid flex-1 grid-cols-[20fr_20fr_35fr_25fr] gap-4 overflow-hidden p-4">
        {/* Column 1: Brain Dump (Capture) */}
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-muted/30">
          <BrainDumpColumn />
        </div>

        {/* Column 2: Lists (Process) */}
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
          <ListsColumn />
        </div>

        {/* Column 3: Timebox (Schedule) - Primary Focus */}
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white">
          <TimeboxColumn />
        </div>

        {/* Column 4: Memo (Review) */}
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
          <MemoColumn />
        </div>
      </div>
    </div>
  );
}
