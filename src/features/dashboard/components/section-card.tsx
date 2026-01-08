"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Ban,
  Brain,
  Clock,
  Lightbulb,
  LucideIcon,
  StickyNote,
  Target,
} from "lucide-react";
import type { ReactNode } from "react";

const ICON_MAP: Record<string, LucideIcon> = {
  Brain,
  Target,
  AlertCircle,
  Lightbulb,
  Ban,
  Clock,
  StickyNote,
};

type SectionCardProps = {
  title: string;
  icon: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  scrollable?: boolean;
  variant?: "default" | "warning";
  fullHeight?: boolean;
};

export function SectionCard({
  title,
  icon,
  children,
  headerAction,
  className,
  scrollable = true,
  variant = "default",
  fullHeight = false,
}: SectionCardProps) {
  const IconComponent = ICON_MAP[icon] ?? Brain;

  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        variant === "warning" && "border-destructive/30 bg-destructive/5",
        className
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {headerAction}
      </div>
      {scrollable ? (
        <ScrollArea className="flex-1 px-2 py-2 sm:px-3 sm:py-3">
          <div className={cn(!fullHeight && "max-h-[240px] sm:max-h-[320px]")}>
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 py-2 sm:px-3 sm:py-3">
          {children}
        </div>
      )}
    </Card>
  );
}
