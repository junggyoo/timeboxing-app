"use client";

import { AppLayout } from "../_components/app-layout";
import { TimelineView } from "./_components/timeline-view";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;

  return (
    <AppLayout>
      <TimelineView />
    </AppLayout>
  );
}
