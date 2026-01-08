"use client";

import { useState } from "react";
import { useSelfDev } from "../../hooks/use-dashboard";
import { useDashboardStore } from "../../store/dashboard-store";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";
import { QuickScheduleDialog } from "@/app/(protected)/dashboard/_components/quick-schedule-dialog";
import type { BaseItem } from "../../types";

export function SelfDevSection() {
	const { items, add, edit, remove, toggle } = useSelfDev();
	const scheduledIds = useDashboardStore((state) =>
		state.getScheduledSourceIds()
	);
	const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);

	const handleSchedule = (item: BaseItem) => {
		setSelectedItem(item);
		setScheduleDialogOpen(true);
	};

	const handleAdd = (value: string) => {
		const tagMatch = value.match(/#\w+/g);
		const tags = tagMatch ?? undefined;
		const title = value.replace(/#\w+/g, "").trim();

		if (title) {
			add(title, tags);
		}
	};

	return (
		<>
			<SectionCard title="Self-Development" icon="Lightbulb">
				<QuickAddInput placeholder="자기 계발 항목 추가" onAdd={handleAdd} />
				{items.length === 0 ? (
					<EmptyState message="자기 계발 목표를 추가하세요" />
				) : (
					<ul role="list" className="space-y-1">
						{items.map((item) => (
							<li key={item.id} role="listitem">
								<DraggableItem
									item={item}
									section="selfDev"
									onToggle={() => toggle(item.id)}
									onEdit={(title) => edit(item.id, title)}
									onRemove={() => remove(item.id)}
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
				sourceSection="selfDev"
			/>
		</>
	);
}
