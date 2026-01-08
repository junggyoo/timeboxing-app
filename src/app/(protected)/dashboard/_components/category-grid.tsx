"use client";

import { DroppableSection } from "@/features/dashboard/components/droppable-section";
import {
  NotToDoSection,
  PrioritiesSection,
  SelfDevSection,
  UrgentWorkSection,
} from "@/features/dashboard/components/sections";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <DroppableSection id="priorities">
        <PrioritiesSection />
      </DroppableSection>
      <DroppableSection id="urgent">
        <UrgentWorkSection />
      </DroppableSection>
      <DroppableSection id="selfDev">
        <SelfDevSection />
      </DroppableSection>
      <DroppableSection id="notToDo">
        <NotToDoSection />
      </DroppableSection>
    </div>
  );
}
