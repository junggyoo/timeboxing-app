export type SectionKey =
  | "brainDump"
  | "priorities"
  | "urgent"
  | "selfDev"
  | "notToDo"
  | "timeBox"
  | "memo";

export type ItemSectionKey = Exclude<SectionKey, "timeBox" | "memo">;

export type BaseItem = {
  id: string;
  title: string;
  note?: string;
  tags?: string[];
  isDone: boolean;
  createdAt: string;
};

export type TimeBoxStatus = "scheduled" | "ongoing" | "done";

export type TimeBoxItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  status: TimeBoxStatus;
  sourceItemId?: string;
  sourceSection?: ItemSectionKey;
  actualDurationMin?: number;
};

export type MemoItem = {
  id: string;
  content: string;
  createdAt: string;
};

export type DashboardState = {
  brainDump: BaseItem[];
  priorities: BaseItem[];
  urgent: BaseItem[];
  selfDev: BaseItem[];
  notToDo: BaseItem[];
  timeBox: TimeBoxItem[];
  memo: MemoItem[];
};

export type SectionConfig = {
  key: SectionKey;
  title: string;
  icon: string;
  gridSpan: number;
};

export type DragItemData = {
  id: string;
  title: string;
  sourceSection: ItemSectionKey;
};

export type DroppableType = "section" | "timeline";

export type TimeSlot = {
  time: string;
  hour: number;
  minute: number;
};
