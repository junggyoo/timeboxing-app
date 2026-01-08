"use client";

import { DndContextProvider } from "./dnd-context-provider";
import { FourColumnLayout } from "./four-column-layout";
import { LeftPanel } from "./left-panel";
import { MobileTabs } from "./mobile-tabs";
import { PlannerHeader } from "./planner-header";
import { RightPanel } from "./right-panel";

export function DashboardView() {
  return (
    <DndContextProvider>
      {/* Mobile: Tabbed Interface */}
      <div className="lg:hidden">
        <div className="space-y-6 p-4">
          <PlannerHeader />
          <MobileTabs />
        </div>
      </div>

      {/* Tablet/Small Desktop: 2-Column (existing layout) */}
      <div className="hidden lg:block xl:hidden">
        <div className="space-y-6 p-6">
          <PlannerHeader />
          <div className="grid grid-cols-2 gap-8">
            <LeftPanel />
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Large Desktop (15-inch+): 4-Column Full-Height */}
      <div className="hidden xl:block">
        <FourColumnLayout />
      </div>
    </DndContextProvider>
  );
}
