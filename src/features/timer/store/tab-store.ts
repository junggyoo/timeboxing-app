"use client";

import { create } from "zustand";

type TabStore = {
  isActiveTab: boolean;
  tabId: string;
  setActiveTab: (isActive: boolean) => void;
  claimActive: () => void;
};

// Generate a unique ID for this tab instance
const generateTabId = () => {
  if (typeof window === "undefined") return "";
  return crypto.randomUUID();
};

export const useTabStore = create<TabStore>((set) => ({
  isActiveTab: true,
  tabId: generateTabId(),

  setActiveTab: (isActive: boolean) => set({ isActiveTab: isActive }),

  claimActive: () => set({ isActiveTab: true }),
}));

// Selectors
export const selectIsActiveTab = (state: TabStore) => state.isActiveTab;
export const selectTabId = (state: TabStore) => state.tabId;
