"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useDragState } from "../drag-state-context";

// Custom event name for ghost position updates
export const BLOCK_GHOST_MOVE_EVENT = "block-ghost-move";

type GhostMoveDetail = {
  x: number;
  y: number;
};

/**
 * Ghost overlay component for block drag visualization.
 * Renders via Portal to document.body with position:fixed.
 * Listens for custom events to update position without triggering React re-renders.
 */
export function BlockDragGhost() {
  const { blockDrag } = useDragState();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting for Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for ghost position updates via custom event
  useEffect(() => {
    if (!blockDrag.blockId) return;

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<GhostMoveDetail>;
      setPosition({ x: customEvent.detail.x, y: customEvent.detail.y });
    };

    document.addEventListener(BLOCK_GHOST_MOVE_EVENT, handler);
    return () => document.removeEventListener(BLOCK_GHOST_MOVE_EVENT, handler);
  }, [blockDrag.blockId]);

  // Don't render if not mounted (SSR) or no active drag
  if (!mounted || !blockDrag.blockId || !blockDrag.ghostData) {
    return null;
  }

  const { ghostData } = blockDrag;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: ghostData.width,
        height: ghostData.height,
        pointerEvents: "none",
        zIndex: 9999,
      }}
      className={cn(
        "rounded border-2 px-1.5 py-0.5 shadow-lg",
        "opacity-90 transition-none",
        ghostData.color.bg,
        ghostData.color.border
      )}
    >
      <p className="truncate text-xs font-medium leading-tight">
        {ghostData.title}
      </p>
    </div>,
    document.body
  );
}

/**
 * Helper function to dispatch ghost position update event.
 * Call this from mousemove handler to update ghost position.
 */
export function dispatchGhostMove(x: number, y: number) {
  const event = new CustomEvent<GhostMoveDetail>(BLOCK_GHOST_MOVE_EVENT, {
    detail: { x, y },
  });
  document.dispatchEvent(event);
}
