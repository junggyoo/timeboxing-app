"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTabStore } from "../store/tab-store";
import { TAB_SYNC_CHANNEL_NAME } from "../constants";

/**
 * Tab synchronization message types
 */
type TabMessage =
  | { type: "CLAIM_ACTIVE"; tabId: string }
  | { type: "ACK_DEACTIVATE"; tabId: string };

/**
 * Hook for enforcing single active tab pattern ("Last Tab Wins")
 *
 * When a tab claims active status, all other tabs are deactivated.
 * Only the active tab should control timer/audio.
 *
 * Usage:
 * ```tsx
 * const { isActiveTab, reclaimActive, claimOnInteraction } = useSingleTabEnforcement();
 *
 * // Show overlay when inactive
 * if (!isActiveTab) return <TabInactiveOverlay />;
 *
 * // Guard timer actions
 * const handleStart = () => {
 *   if (!isActiveTab) return;
 *   startTimer();
 * };
 * ```
 */
export function useSingleTabEnforcement() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isActiveTab = useTabStore((s) => s.isActiveTab);
  const tabId = useTabStore((s) => s.tabId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const claimActiveStore = useTabStore((s) => s.claimActive);

  useEffect(() => {
    // Check for BroadcastChannel support
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    // Create channel
    channelRef.current = new BroadcastChannel(TAB_SYNC_CHANNEL_NAME);

    const handleMessage = (e: MessageEvent<TabMessage>) => {
      const message = e.data;

      if (message.type === "CLAIM_ACTIVE" && message.tabId !== tabId) {
        // Another tab is claiming active status - deactivate this tab
        setActiveTab(false);
      }
    };

    channelRef.current.addEventListener("message", handleMessage);

    // On mount, claim active status (this tab just opened/focused)
    channelRef.current.postMessage({
      type: "CLAIM_ACTIVE",
      tabId,
    } as TabMessage);

    return () => {
      channelRef.current?.removeEventListener("message", handleMessage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [tabId, setActiveTab]);

  /**
   * Explicitly reclaim active status (e.g., user clicks "Use This Tab")
   */
  const reclaimActive = useCallback(() => {
    claimActiveStore();
    channelRef.current?.postMessage({
      type: "CLAIM_ACTIVE",
      tabId,
    } as TabMessage);
  }, [tabId, claimActiveStore]);

  /**
   * Claim on user interaction (for maintaining "last tab wins" pattern)
   * Only broadcasts if this tab is currently active
   */
  const claimOnInteraction = useCallback(() => {
    if (!isActiveTab) return; // Already inactive, require explicit reclaim

    channelRef.current?.postMessage({
      type: "CLAIM_ACTIVE",
      tabId,
    } as TabMessage);
  }, [tabId, isActiveTab]);

  return {
    isActiveTab,
    reclaimActive,
    claimOnInteraction,
  };
}
