"use client";

import { create } from "zustand";
import type {
  BaseItem,
  DashboardState,
  ItemSectionKey,
  MemoItem,
  SectionKey,
  TimeBoxItem,
} from "../types";
import {
  SAMPLE_BRAIN_DUMP,
  SAMPLE_MEMO,
  SAMPLE_NOT_TO_DO,
  SAMPLE_PRIORITIES,
  SAMPLE_SELF_DEV,
  SAMPLE_TIMEBOX,
  SAMPLE_URGENT,
} from "../constants";

type DashboardActions = {
  addItem: (section: ItemSectionKey, title: string, tags?: string[]) => void;
  editItem: (
    section: SectionKey,
    id: string,
    patch: Partial<BaseItem | TimeBoxItem | MemoItem>
  ) => void;
  removeItem: (section: SectionKey, id: string) => void;
  toggleDone: (section: ItemSectionKey, id: string) => void;
  reorderItems: (
    section: ItemSectionKey,
    fromIndex: number,
    toIndex: number
  ) => void;
  moveItem: (from: ItemSectionKey, to: ItemSectionKey, id: string) => void;
  addTimeBox: (item: Omit<TimeBoxItem, "id">) => void;
  updateMemo: (content: string) => void;
};

type DashboardStore = DashboardState & DashboardActions;

const createItem = (title: string, tags?: string[]): BaseItem => ({
  id: crypto.randomUUID(),
  title,
  tags,
  isDone: false,
  createdAt: new Date().toISOString(),
});

const reorder = <T>(list: T[], fromIndex: number, toIndex: number): T[] => {
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  brainDump: SAMPLE_BRAIN_DUMP,
  priorities: SAMPLE_PRIORITIES,
  urgent: SAMPLE_URGENT,
  selfDev: SAMPLE_SELF_DEV,
  notToDo: SAMPLE_NOT_TO_DO,
  timeBox: SAMPLE_TIMEBOX,
  memo: SAMPLE_MEMO,

  addItem: (section, title, tags) =>
    set((state) => ({
      [section]: [...state[section], createItem(title, tags)],
    })),

  editItem: (section, id, patch) =>
    set((state) => {
      if (section === "memo") {
        return {
          memo: state.memo.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        };
      }
      if (section === "timeBox") {
        return {
          timeBox: state.timeBox.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        };
      }
      return {
        [section]: (state[section] as BaseItem[]).map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      };
    }),

  removeItem: (section, id) =>
    set((state) => {
      if (section === "memo") {
        return { memo: state.memo.filter((item) => item.id !== id) };
      }
      if (section === "timeBox") {
        return { timeBox: state.timeBox.filter((item) => item.id !== id) };
      }
      return {
        [section]: (state[section] as BaseItem[]).filter(
          (item) => item.id !== id
        ),
      };
    }),

  toggleDone: (section, id) =>
    set((state) => ({
      [section]: (state[section] as BaseItem[]).map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      ),
    })),

  reorderItems: (section, fromIndex, toIndex) =>
    set((state) => ({
      [section]: reorder(state[section] as BaseItem[], fromIndex, toIndex),
    })),

  moveItem: (from, to, id) =>
    set((state) => {
      const fromItems = state[from] as BaseItem[];
      const toItems = state[to] as BaseItem[];
      const item = fromItems.find((i) => i.id === id);

      if (!item) return state;

      return {
        [from]: fromItems.filter((i) => i.id !== id),
        [to]: [...toItems, item],
      };
    }),

  addTimeBox: (item) =>
    set((state) => ({
      timeBox: [
        ...state.timeBox,
        { ...item, id: crypto.randomUUID() },
      ],
    })),

  updateMemo: (content) =>
    set((state) => {
      if (state.memo.length === 0) {
        return {
          memo: [
            {
              id: crypto.randomUUID(),
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return {
        memo: state.memo.map((item, index) =>
          index === 0 ? { ...item, content } : item
        ),
      };
    }),
}));
