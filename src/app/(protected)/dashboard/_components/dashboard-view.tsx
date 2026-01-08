"use client";

import { DndContextProvider } from "./dnd-context-provider";
import { LeftPanel } from "./left-panel";
import { MobileTabs } from "./mobile-tabs";
import { PlannerHeader } from "./planner-header";
import { RightPanel } from "./right-panel";

export function DashboardView() {
  return (
    <DndContextProvider>
      <div className="space-y-6 p-4 lg:p-6">
        <PlannerHeader />

        {/* Desktop: Two-Column Split */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          <LeftPanel />
          <RightPanel />
        </div>

        {/* Mobile/Tablet: Tabbed Interface */}
        <div className="lg:hidden">
          <MobileTabs />
        </div>
      </div>
    </DndContextProvider>
  );
}
