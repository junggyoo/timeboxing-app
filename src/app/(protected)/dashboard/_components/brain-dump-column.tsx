"use client";

import { DroppableSection } from "@/features/dashboard/components/droppable-section";
import { BrainDumpSection } from "@/features/dashboard/components/sections";

export function BrainDumpColumn() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <DroppableSection id="brainDump" className="h-full">
        <BrainDumpSection fullHeight />
      </DroppableSection>
    </div>
  );
}
