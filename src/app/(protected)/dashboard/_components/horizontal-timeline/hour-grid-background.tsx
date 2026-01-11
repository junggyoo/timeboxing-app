"use client";

import { cn } from "@/lib/utils";
import { GRID_COLUMNS } from "./constants";

/**
 * Visual grid background showing 10-minute interval lines.
 * Renders 5 vertical dividing lines (at 10, 20, 30, 40, 50 minutes).
 * The 30-minute mark (center) has stronger visibility.
 */
export function HourGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Render 5 vertical lines (1/6, 2/6, 3/6, 4/6, 5/6 positions) */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "absolute bottom-0 top-0 w-px",
            // 30-minute mark (center line) is more visible
            i === 3
              ? "bg-border"
              : "border-l border-dashed border-border/40"
          )}
          style={{ left: `${(i / GRID_COLUMNS) * 100}%` }}
        />
      ))}
    </div>
  );
}
