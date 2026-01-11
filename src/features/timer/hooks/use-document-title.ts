"use client";

import { useEffect, useRef } from "react";
import { formatTime } from "../lib/format-time";

type UseDocumentTitleOptions = {
  enabled: boolean;
  remainingMs: number;
  isOvertime: boolean;
  taskTitle: string | null;
};

export function useDocumentTitle({
  enabled,
  remainingMs,
  isOvertime,
  taskTitle,
}: UseDocumentTitleOptions) {
  const originalTitleRef = useRef<string>("");
  const lastTitleRef = useRef<string>("");

  // Store original title when enabled, restore when disabled
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (enabled) {
      // Store original title only once when first enabled
      if (!originalTitleRef.current) {
        originalTitleRef.current = document.title;
      }
    } else {
      // Restore original title when disabled
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
        originalTitleRef.current = "";
        lastTitleRef.current = "";
      }
    }
  }, [enabled]);

  // Update title when timer is running (no cleanup to avoid flickering)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!enabled || !taskTitle) return;

    const formattedTime = formatTime(remainingMs, isOvertime);
    const newTitle = `(${formattedTime}) ${taskTitle}`;

    // Only update if title actually changed (prevents unnecessary DOM updates)
    if (lastTitleRef.current !== newTitle) {
      document.title = newTitle;
      lastTitleRef.current = newTitle;
    }
  }, [enabled, remainingMs, isOvertime, taskTitle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined" && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, []);
}
