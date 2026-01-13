"use client";

import { BrainDumpSection } from "@/features/dashboard/components/sections";

export function BrainDumpColumn() {
	return (
		<div className="min-h-0 flex-1 overflow-hidden">
			<BrainDumpSection fullHeight />
		</div>
	);
}
