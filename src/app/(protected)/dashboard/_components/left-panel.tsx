"use client";

import { DroppableSection } from "@/features/dashboard/components/droppable-section";
import { BrainDumpSection } from "@/features/dashboard/components/sections";
import { CategoryGrid } from "./category-grid";

export function LeftPanel() {
  return (
    <div className="flex flex-col gap-4">
      <DroppableSection id="brainDump">
        <BrainDumpSection />
      </DroppableSection>
      <CategoryGrid />
    </div>
  );
}
