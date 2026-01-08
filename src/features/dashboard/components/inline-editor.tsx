"use client";

import { Input } from "@/components/ui/input";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

type InlineEditorProps = {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
};

export function InlineEditor({ value, onSave, onCancel }: InlineEditorProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(editValue);
  };

  return (
    <Input
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="h-7 text-sm"
      aria-label="항목 편집"
    />
  );
}
