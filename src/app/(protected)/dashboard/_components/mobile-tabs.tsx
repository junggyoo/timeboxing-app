"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DroppableSection } from "@/features/dashboard/components/droppable-section";
import { BrainDumpSection, MemoSection } from "@/features/dashboard/components/sections";
import { Calendar, ClipboardList } from "lucide-react";
import { CategoryGrid } from "./category-grid";
import { TimelineSchedule } from "./timeline-schedule";

export function MobileTabs() {
  return (
    <Tabs defaultValue="planning" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="planning" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Planning
        </TabsTrigger>
        <TabsTrigger value="schedule" className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule
        </TabsTrigger>
      </TabsList>
      <TabsContent value="planning" className="mt-4 space-y-4">
        <DroppableSection id="brainDump">
          <BrainDumpSection />
        </DroppableSection>
        <CategoryGrid />
      </TabsContent>
      <TabsContent value="schedule" className="mt-4 space-y-4">
        <TimelineSchedule />
        <MemoSection />
      </TabsContent>
    </Tabs>
  );
}
