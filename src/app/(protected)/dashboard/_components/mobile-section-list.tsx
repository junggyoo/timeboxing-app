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

export function MobileSectionList() {
  return (
    <div className="flex flex-col gap-4 md:hidden">
      <BrainDumpSection />
      <PrioritiesSection />
      <UrgentWorkSection />
      <SelfDevSection />
      <NotToDoSection />
      <TimeboxSection />
      <MemoSection />
    </div>
  );
}
