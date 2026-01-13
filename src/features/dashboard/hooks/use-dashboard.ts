"use client";

import { useShallow } from "zustand/react/shallow";
import { useDashboardStore } from "../store/dashboard-store";
import type { ItemSectionKey, SectionKey } from "../types";

export const useDashboardSection = <T>(section: SectionKey) => {
  return useDashboardStore(useShallow((state) => state[section] as T));
};

export const useDashboardActions = () => {
  return useDashboardStore(
    useShallow((state) => ({
      addItem: state.addItem,
      editItem: state.editItem,
      removeItem: state.removeItem,
      toggleDone: state.toggleDone,
      reorderItems: state.reorderItems,
      moveItem: state.moveItem,
      addTimeBox: state.addTimeBox,
      updateMemo: state.updateMemo,
      updateBrainDump: state.updateBrainDump,
    }))
  );
};

export const useBrainDump = () => {
  const content = useDashboardStore(useShallow((state) => state.brainDump));
  const { updateBrainDump } = useDashboardActions();

  return {
    content,
    update: updateBrainDump,
  };
};

export const usePriorities = () => {
  const items = useDashboardStore(useShallow((state) => state.priorities));
  const { addItem, editItem, removeItem, toggleDone, reorderItems } =
    useDashboardActions();

  return {
    items,
    add: (title: string) => addItem("priorities", title),
    edit: (id: string, title: string) =>
      editItem("priorities", id, { title }),
    remove: (id: string) => removeItem("priorities", id),
    toggle: (id: string) => toggleDone("priorities", id),
    reorder: (fromIndex: number, toIndex: number) =>
      reorderItems("priorities", fromIndex, toIndex),
  };
};

export const useUrgent = () => {
  const items = useDashboardStore(useShallow((state) => state.urgent));
  const { addItem, editItem, removeItem, toggleDone } = useDashboardActions();

  return {
    items,
    add: (title: string) => addItem("urgent", title),
    edit: (id: string, title: string) => editItem("urgent", id, { title }),
    remove: (id: string) => removeItem("urgent", id),
    toggle: (id: string) => toggleDone("urgent", id),
  };
};

export const useSelfDev = () => {
  const items = useDashboardStore(useShallow((state) => state.selfDev));
  const { addItem, editItem, removeItem, toggleDone } = useDashboardActions();

  return {
    items,
    add: (title: string, tags?: string[]) => addItem("selfDev", title, tags),
    edit: (id: string, title: string) => editItem("selfDev", id, { title }),
    remove: (id: string) => removeItem("selfDev", id),
    toggle: (id: string) => toggleDone("selfDev", id),
  };
};

export const useNotToDo = () => {
  const items = useDashboardStore(useShallow((state) => state.notToDo));
  const { addItem, editItem, removeItem, toggleDone } = useDashboardActions();

  return {
    items,
    add: (title: string) => addItem("notToDo", title),
    edit: (id: string, title: string) => editItem("notToDo", id, { title }),
    remove: (id: string) => removeItem("notToDo", id),
    toggle: (id: string) => toggleDone("notToDo", id),
  };
};

export const useTimeBox = () => {
  const items = useDashboardStore(useShallow((state) => state.timeBox));
  const { addTimeBox, removeItem } = useDashboardActions();

  return {
    items,
    add: addTimeBox,
    remove: (id: string) => removeItem("timeBox", id),
  };
};

export const useMemo = () => {
  const items = useDashboardStore(useShallow((state) => state.memo));
  const { updateMemo } = useDashboardActions();

  return {
    content: items[0]?.content ?? "",
    update: updateMemo,
  };
};
