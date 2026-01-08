"use client";

import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import { useMemo } from "../../hooks/use-dashboard";
import { SectionCard } from "../section-card";

export function MemoSection() {
  const { content, update } = useMemo();
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleBlur = useCallback(() => {
    if (localContent !== content) {
      update(localContent);
    }
  }, [localContent, content, update]);

  return (
    <SectionCard title="Memo" icon="StickyNote" scrollable={false}>
      <Textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleBlur}
        placeholder="오늘의 메모, 회고, 아이디어를 자유롭게 적어보세요..."
        className="min-h-[200px] resize-none border-0 p-0 text-sm focus-visible:ring-0"
        aria-label="메모 입력"
      />
    </SectionCard>
  );
}
