"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { usePriorities } from "../../hooks/use-dashboard";
import { useDashboardStore } from "../../store/dashboard-store";
import { MAX_PRIORITIES } from "../../constants";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";
import { QuickScheduleDialog } from "@/app/(protected)/dashboard/_components/quick-schedule-dialog";
import type { BaseItem } from "../../types";

type PrioritiesSectionProps = {
	fullHeight?: boolean;
};

export function PrioritiesSection({ fullHeight }: PrioritiesSectionProps) {
	const { items, add, edit, remove, toggle, reorder } = usePriorities();
	const scheduledIds = useDashboardStore((state) =>
		state.getScheduledSourceIds()
	);
	const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);

	const handleSchedule = (item: BaseItem) => {
		setSelectedItem(item);
		setScheduleDialogOpen(true);
	};

	const handleAdd = (title: string) => {
		if (items.length >= MAX_PRIORITIES) {
			return;
		}
		add(title);
	};

	const headerAction =
		items.length >= MAX_PRIORITIES ? (
			<Badge variant="secondary" className="text-xs">
				최대 {MAX_PRIORITIES}개
			</Badge>
		) : (
			<Badge variant="outline" className="text-xs">
				{items.length}/{MAX_PRIORITIES}
			</Badge>
		);

	return (
		<>
			<SectionCard title="Priorities" icon="Target" headerAction={headerAction} fullHeight={fullHeight}>
				{items.length < MAX_PRIORITIES && (
					<QuickAddInput placeholder="오늘의 우선순위 추가" onAdd={handleAdd} />
				)}
				{items.length === 0 ? (
					<EmptyState message="오늘 가장 중요한 일을 추가하세요" />
				) : (
					<ul role="list" className="space-y-1">
						{items.map((item, index) => (
							<li key={item.id} role="listitem">
								<DraggableItem
									item={item}
									section="priorities"
									onToggle={() => toggle(item.id)}
									onEdit={(title) => edit(item.id, title)}
									onRemove={() => remove(item.id)}
									showReorder
									onMoveUp={() => reorder(index, index - 1)}
									onMoveDown={() => reorder(index, index + 1)}
									isFirst={index === 0}
									isLast={index === items.length - 1}
									onSchedule={() => handleSchedule(item)}
									isScheduled={scheduledIds.has(item.id)}
								/>
							</li>
						))}
					</ul>
				)}
			</SectionCard>
			<QuickScheduleDialog
				open={scheduleDialogOpen}
				onOpenChange={setScheduleDialogOpen}
				item={selectedItem}
				sourceSection="priorities"
			/>
		</>
	);
}
