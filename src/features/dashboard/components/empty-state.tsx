"use client";

import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  message = "항목이 없습니다",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground/50" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {actionLabel && onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
