"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Monitor } from "lucide-react";
import { useSingleTabEnforcement } from "../hooks/use-single-tab-enforcement";

/**
 * Full-screen overlay displayed when this tab is inactive
 *
 * Shown when another tab has claimed control of the timer.
 * Provides a button to reclaim control ("Use This Tab Instead").
 */
export function TabInactiveOverlay() {
  const { isActiveTab, reclaimActive } = useSingleTabEnforcement();

  if (isActiveTab) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100]",
        "flex flex-col items-center justify-center gap-6",
        "bg-background/95 backdrop-blur-sm"
      )}
    >
      <Monitor className="h-16 w-16 text-muted-foreground" />
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Timebox is open in another tab
        </h2>
        <p className="mt-2 text-muted-foreground">
          The timer is being controlled from a different browser tab.
        </p>
      </div>
      <Button onClick={reclaimActive} size="lg">
        Use This Tab Instead
      </Button>
    </div>
  );
}
