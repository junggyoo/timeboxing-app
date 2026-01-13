"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import {
  Brain,
  Clock,
  Sparkles,
  Target,
  Zap,
  Ban,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BaseItem, ItemSectionKey } from "@/features/dashboard/types";
import { useShallow } from "zustand/react/shallow";

// ============================================================================
// Types
// ============================================================================

type TaskSelectorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTime: string;
};

type FilterCategory = "all" | ItemSectionKey;

type SectionConfig = {
  key: ItemSectionKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
};

type TaskItemProps = {
  item: BaseItem;
  isScheduled: boolean;
  onSelect: () => void;
};

type SectionGroupProps = {
  config: SectionConfig;
  items: BaseItem[];
  scheduledIds: Set<string>;
  onSelectTask: (itemId: string, section: ItemSectionKey) => void;
};

type FilterChipProps = {
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
};

type FilterChipsRowProps = {
  selectedFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  counts: Record<FilterCategory, number>;
};

type NotToDoConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BaseItem | null;
  onConfirm: () => void;
};

type HideScheduledToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// ============================================================================
// Constants
// ============================================================================

const SECTIONS: SectionConfig[] = [
  { key: "priorities", title: "Priorities", icon: Target },
  { key: "urgent", title: "Urgent Work", icon: Zap },
  { key: "selfDev", title: "Self Development", icon: Sparkles },
  { key: "notToDo", title: "Not To-Do", icon: Ban },
];

const FILTER_OPTIONS: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "priorities", label: "Priorities" },
  { key: "urgent", label: "Urgent" },
  { key: "selfDev", label: "Self-Dev" },
  { key: "notToDo", label: "Not To-Do" },
];

// ============================================================================
// Utility Functions
// ============================================================================

function sortItemsUnscheduledFirst(
  items: BaseItem[],
  scheduledIds: Set<string>
): BaseItem[] {
  const unscheduled: BaseItem[] = [];
  const scheduled: BaseItem[] = [];

  for (const item of items) {
    if (scheduledIds.has(item.id)) {
      scheduled.push(item);
    } else {
      unscheduled.push(item);
    }
  }

  return [...unscheduled, ...scheduled];
}

// ============================================================================
// Sub-Components
// ============================================================================

function FilterChip({ label, count, isSelected, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] min-w-[20px] text-center",
          isSelected
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-background text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function FilterChipsRow({
  selectedFilter,
  onFilterChange,
  counts,
}: FilterChipsRowProps) {
  return (
    <div className="sticky top-0 z-10 bg-background px-6 pb-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
        {FILTER_OPTIONS.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            count={counts[filter.key]}
            isSelected={selectedFilter === filter.key}
            onClick={() => onFilterChange(filter.key)}
          />
        ))}
      </div>
    </div>
  );
}

function HideScheduledToggle({
  checked,
  onCheckedChange,
}: HideScheduledToggleProps) {
  return (
    <div className="flex items-center justify-between px-6 py-2 border-b">
      <label
        htmlFor="hide-scheduled"
        className="text-xs text-muted-foreground cursor-pointer"
      >
        Hide scheduled items
      </label>
      <Switch
        id="hide-scheduled"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function TaskItem({ item, isScheduled, onSelect }: TaskItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/50 active:bg-muted",
        isScheduled && "opacity-50"
      )}
    >
      {isScheduled && <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          item.isDone && "line-through text-muted-foreground"
        )}
      >
        {item.title}
      </span>
      {isScheduled && (
        <span className="text-[10px] text-muted-foreground shrink-0">
          Scheduled
        </span>
      )}
    </button>
  );
}

function SectionGroup({
  config,
  items,
  scheduledIds,
  onSelectTask,
}: SectionGroupProps) {
  const Icon = config.icon;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 mx-6">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {config.title}
        </span>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      <div className="space-y-1.5 px-6">
        {items.map((item) => (
          <TaskItem
            key={item.id}
            item={item}
            isScheduled={scheduledIds.has(item.id)}
            onSelect={() => onSelectTask(item.id, config.key)}
          />
        ))}
      </div>
    </div>
  );
}

function NotToDoConfirmDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: NotToDoConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Not To-Do Warning
          </DialogTitle>
          <DialogDescription>
            This item is marked as &quot;Not To-Do&quot;. Are you sure you want
            to schedule it?
          </DialogDescription>
        </DialogHeader>
        {item && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium">{item.title}</p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Schedule Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TaskSelectorSheet({
  open,
  onOpenChange,
  targetTime,
}: TaskSelectorSheetProps) {
  // Local state
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");
  const [hideScheduled, setHideScheduled] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingNotToDoItem, setPendingNotToDoItem] = useState<BaseItem | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setSelectedFilter("all");
      setHideScheduled(false);
      setIsCreatingNew(false);
      setNewTaskTitle("");
    }
  }, [open]);

  // Store access
  const {
    priorities,
    urgent,
    selfDev,
    notToDo,
    assignToTimeline,
    addTimeBox,
    getScheduledSourceIds,
  } = useDashboardStore(
    useShallow((state) => ({
      priorities: state.priorities,
      urgent: state.urgent,
      selfDev: state.selfDev,
      notToDo: state.notToDo,
      assignToTimeline: state.assignToTimeline,
      addTimeBox: state.addTimeBox,
      getScheduledSourceIds: state.getScheduledSourceIds,
    }))
  );

  const scheduledIds = getScheduledSourceIds();

  // Raw section data
  const sectionData: Record<ItemSectionKey, BaseItem[]> = {
    priorities,
    urgent,
    selfDev,
    notToDo,
  };

  // Sorted and filtered section data
  const processedSectionData = useMemo(() => {
    const result = {} as Record<ItemSectionKey, BaseItem[]>;

    for (const key of Object.keys(sectionData) as ItemSectionKey[]) {
      let items = sortItemsUnscheduledFirst(sectionData[key], scheduledIds);
      if (hideScheduled) {
        items = items.filter((item) => !scheduledIds.has(item.id));
      }
      result[key] = items;
    }

    return result;
  }, [
    priorities,
    urgent,
    selfDev,
    notToDo,
    scheduledIds,
    hideScheduled,
  ]);

  // Calculate counts for filter chips
  const counts = useMemo(() => {
    const all = Object.values(processedSectionData).reduce(
      (sum, items) => sum + items.length,
      0
    );
    return {
      all,
      priorities: processedSectionData.priorities.length,
      urgent: processedSectionData.urgent.length,
      selfDev: processedSectionData.selfDev.length,
      notToDo: processedSectionData.notToDo.length,
    };
  }, [processedSectionData]);

  // Handle task selection with Not-To-Do check
  const handleSelectTask = (itemId: string, section: ItemSectionKey) => {
    if (section === "notToDo") {
      const item = notToDo.find((i) => i.id === itemId);
      if (item) {
        setPendingNotToDoItem(item);
        setConfirmDialogOpen(true);
      }
      return;
    }

    assignToTimeline(itemId, section, targetTime, 30);
    onOpenChange(false);
  };

  // Confirm Not-To-Do scheduling
  const handleConfirmNotToDo = () => {
    if (pendingNotToDoItem) {
      assignToTimeline(pendingNotToDoItem.id, "notToDo", targetTime, 30);
      setConfirmDialogOpen(false);
      setPendingNotToDoItem(null);
      onOpenChange(false);
    }
  };

  // Calculate end time from start time and duration
  const calculateEndTime = (startAt: string, durationMin: number): string => {
    const [hours, minutes] = startAt.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMin;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  };

  // Handle new task creation
  const handleCreateNewTask = () => {
    if (!newTaskTitle.trim()) return;

    addTimeBox({
      title: newTaskTitle.trim(),
      startAt: targetTime,
      endAt: calculateEndTime(targetTime, 30),
      durationMin: 30,
      status: "scheduled",
    });

    setNewTaskTitle("");
    setIsCreatingNew(false);
    onOpenChange(false);
  };

  // Handle keyboard events for new task input
  const handleNewTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && newTaskTitle.trim()) {
      e.preventDefault();
      handleCreateNewTask();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewTaskTitle("");
      setIsCreatingNew(false);
    }
  };

  // Sections to render based on filter
  const sectionsToRender =
    selectedFilter === "all"
      ? SECTIONS
      : SECTIONS.filter((s) => s.key === selectedFilter);

  // Check if showing single category (hide section headers)
  const showSectionHeaders = selectedFilter === "all";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl px-0">
          <SheetHeader className="px-6 pb-4 border-b">
            <SheetTitle>
              {isCreatingNew ? "Create New Task" : "Select Task"}
            </SheetTitle>
            <SheetDescription>
              {isCreatingNew
                ? `Create a new task for ${targetTime}`
                : `Select a task to schedule at ${targetTime}`}
            </SheetDescription>
          </SheetHeader>

          {isCreatingNew ? (
            /* Create New Task Form */
            <div className="px-6 py-6 space-y-4">
              <Input
                autoFocus
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleNewTaskKeyDown}
                className="h-12 text-base"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewTaskTitle("");
                    setIsCreatingNew(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateNewTask}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1"
                >
                  Add to {targetTime}
                </Button>
              </div>
            </div>
          ) : (
            /* Task List View */
            <>
              {/* Create New Task Button */}
              <div className="px-6 py-3 border-b">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-11"
                  onClick={() => setIsCreatingNew(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create New Task
                </Button>
              </div>

              <FilterChipsRow
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                counts={counts}
              />

              <HideScheduledToggle
                checked={hideScheduled}
                onCheckedChange={setHideScheduled}
              />

              <ScrollArea className="h-[calc(70vh-240px)]">
                <div className="space-y-4 py-4">
                  {counts.all === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No tasks available.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add tasks in the Planning tab or create a new one above.
                      </p>
                    </div>
                  ) : showSectionHeaders ? (
                    // All mode: show grouped sections with headers
                    sectionsToRender.map((config) => (
                      <SectionGroup
                        key={config.key}
                        config={config}
                        items={processedSectionData[config.key]}
                        scheduledIds={scheduledIds}
                        onSelectTask={handleSelectTask}
                      />
                    ))
                  ) : (
                    // Single category mode: show items without section header
                    <div className="space-y-1.5 px-6">
                      {processedSectionData[selectedFilter as ItemSectionKey].map(
                        (item) => (
                          <TaskItem
                            key={item.id}
                            item={item}
                            isScheduled={scheduledIds.has(item.id)}
                            onSelect={() =>
                              handleSelectTask(
                                item.id,
                                selectedFilter as ItemSectionKey
                              )
                            }
                          />
                        )
                      )}
                      {processedSectionData[selectedFilter as ItemSectionKey]
                        .length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <p className="text-sm text-muted-foreground">
                            No tasks in this category.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      <NotToDoConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        item={pendingNotToDoItem}
        onConfirm={handleConfirmNotToDo}
      />
    </>
  );
}
