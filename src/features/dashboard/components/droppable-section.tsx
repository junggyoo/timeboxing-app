"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DroppableSectionProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export function DroppableSection({
  id,
  children,
  className,
}: DroppableSectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg transition-all duration-200",
        isOver && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
}
