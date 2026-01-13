"use client";

import { useBrainDump } from "../../hooks/use-dashboard";
import { SectionCard } from "../section-card";
import { BrainDumpEditor } from "../brain-dump-editor";

type BrainDumpSectionProps = {
	fullHeight?: boolean;
};

export function BrainDumpSection({ fullHeight }: BrainDumpSectionProps) {
	const { content, update } = useBrainDump();

	return (
		<SectionCard
			title="Brain Dump"
			icon="Brain"
			scrollable={false}
			fullHeight={fullHeight}
		>
			<BrainDumpEditor initialContent={content} onSave={update} />
		</SectionCard>
	);
}
