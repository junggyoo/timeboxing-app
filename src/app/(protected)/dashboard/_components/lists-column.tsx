"use client";

import { DroppableSection } from "@/features/dashboard/components/droppable-section";
import {
  NotToDoSection,
  PrioritiesSection,
  SelfDevSection,
  UrgentWorkSection,
} from "@/features/dashboard/components/sections";

export function ListsColumn() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <DroppableSection id="priorities" className="h-full">
          <PrioritiesSection fullHeight />
        </DroppableSection>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <DroppableSection id="urgent" className="h-full">
          <UrgentWorkSection fullHeight />
        </DroppableSection>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <DroppableSection id="selfDev" className="h-full">
          <SelfDevSection fullHeight />
        </DroppableSection>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <DroppableSection id="notToDo" className="h-full">
          <NotToDoSection fullHeight />
        </DroppableSection>
      </div>
    </div>
  );
}
