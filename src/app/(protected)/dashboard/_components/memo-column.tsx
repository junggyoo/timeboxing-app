"use client";

import { MemoSection } from "@/features/dashboard/components/sections";

export function MemoColumn() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <MemoSection fullHeight />
    </div>
  );
}
