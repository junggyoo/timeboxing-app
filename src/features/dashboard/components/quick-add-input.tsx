"use client";

import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { KeyboardEvent, useState } from "react";

type QuickAddInputProps = {
  placeholder?: string;
  onAdd: (value: string) => void;
};

export function QuickAddInput({
  placeholder = "새 항목 추가...",
  onAdd,
}: QuickAddInputProps) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onAdd(value.trim());
      setValue("");
    }
    if (e.key === "Escape") {
      setValue("");
      e.currentTarget.blur();
    }
  };

  return (
    <div className="relative mb-3">
      <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
