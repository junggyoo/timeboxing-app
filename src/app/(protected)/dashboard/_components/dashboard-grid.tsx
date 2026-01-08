"use client";

import {
  BrainDumpSection,
  MemoSection,
  NotToDoSection,
  PrioritiesSection,
  SelfDevSection,
  TimeboxSection,
  UrgentWorkSection,
} from "@/features/dashboard/components/sections";

export function DashboardGrid() {
  return (
    <div className="hidden md:grid md:grid-cols-12 md:gap-4">
      {/* Row 1 */}
      <div className="md:col-span-8">
        <BrainDumpSection />
      </div>
      <div className="md:col-span-4">
        <PrioritiesSection />
      </div>

      {/* Row 2 */}
      <div className="md:col-span-4">
        <UrgentWorkSection />
      </div>
      <div className="md:col-span-4">
        <SelfDevSection />
      </div>
      <div className="md:col-span-4">
        <NotToDoSection />
      </div>

      {/* Row 3 */}
      <div className="md:col-span-8">
        <TimeboxSection />
      </div>
      <div className="md:col-span-4">
        <MemoSection />
      </div>
    </div>
  );
}
