"use client";

import { AppLayout } from "../_components/app-layout";
import { DashboardView } from "./_components/dashboard-view";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;

  return (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  );
}
