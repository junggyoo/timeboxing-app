"use client";

import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { useBrainDump } from "../../hooks/use-dashboard";
import { SectionCard } from "../section-card";

type BrainDumpSectionProps = {
	fullHeight?: boolean;
};

export function BrainDumpSection({ fullHeight }: BrainDumpSectionProps) {
	const { content, update } = useBrainDump();
	const [localContent, setLocalContent] = useState(content);

	// Sync with store when content changes externally
	useEffect(() => {
		setLocalContent(content);
	}, [content]);

	// Debounced auto-save: save 500ms after user stops typing
	useEffect(() => {
		const timer = setTimeout(() => {
			if (localContent !== content) {
				update(localContent);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [localContent, content, update]);

	// Also save on blur (immediate save when leaving textarea)
	const handleBlur = useCallback(() => {
		if (localContent !== content) {
			update(localContent);
		}
	}, [localContent, content, update]);

	return (
		<SectionCard title="Brain Dump" icon="Brain" scrollable={false} fullHeight={fullHeight}>
			<Textarea
				value={localContent}
				onChange={(e) => setLocalContent(e.target.value)}
				onBlur={handleBlur}
				placeholder="생각을 자유롭게 적어보세요. 아이디어, 할 일, 메모 등 무엇이든 괜찮아요."
				className="min-h-[300px] resize-none border-0 p-0 text-sm focus-visible:ring-0"
				aria-label="Brain Dump 입력"
			/>
		</SectionCard>
	);
}
