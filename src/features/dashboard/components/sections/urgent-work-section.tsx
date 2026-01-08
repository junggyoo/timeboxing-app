"use client";

import { useState } from "react";
import { useUrgent } from "../../hooks/use-dashboard";
import { useDashboardStore } from "../../store/dashboard-store";
import { DraggableItem } from "../draggable-item";
import { EmptyState } from "../empty-state";
import { QuickAddInput } from "../quick-add-input";
import { SectionCard } from "../section-card";
import { QuickScheduleDialog } from "@/app/(protected)/dashboard/_components/quick-schedule-dialog";
import type { BaseItem } from "../../types";

export function UrgentWorkSection() {
	const { items, add, edit, remove, toggle } = useUrgent();
	const scheduledIds = useDashboardStore((state) =>
		state.getScheduledSourceIds()
	);
	const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);

	const handleSchedule = (item: BaseItem) => {
		setSelectedItem(item);
		setScheduleDialogOpen(true);
	};

	return (
		<>
			<SectionCard title="Urgent Work" icon="AlertCircle">
				<QuickAddInput placeholder="긴급 업무 추가" onAdd={add} />
				{items.length === 0 ? (
					<EmptyState message="긴급한 업무가 없습니다" />
				) : (
					<ul role="list" className="space-y-1">
						{items.map((item) => (
							<li key={item.id} role="listitem">
								<DraggableItem
									item={item}
									section="urgent"
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
				sourceSection="urgent"
			/>
		</>
	);
}
