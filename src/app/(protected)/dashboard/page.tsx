"use client";

import { AppLayout } from "../_components/app-layout";
import { DashboardView } from "./_components/dashboard-view";
import {
	TimerWidget,
	TimerFullscreen,
	TimerMobileBar,
	TimerProvider,
	BreakCountdown,
} from "@/features/timer";

type DashboardPageProps = {
	params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
	void params;

	return (
		<TimerProvider>
			<AppLayout>
				<DashboardView />
				{/* Timer components */}
				<TimerWidget />
				<TimerFullscreen />
				<TimerMobileBar />
				<BreakCountdown />
			</AppLayout>
		</TimerProvider>
	);
}
