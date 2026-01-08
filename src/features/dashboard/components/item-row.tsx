"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
} from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";
import type { BaseItem } from "../types";
import { InlineEditor } from "./inline-editor";

type ItemRowProps = {
  item: BaseItem;
  onToggle: () => void;
  onEdit: (title: string) => void;
  onRemove: () => void;
  variant?: "normal" | "inverted";
  showPromote?: boolean;
  onPromote?: () => void;
  promoteLabel?: string;
  showReorder?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
};

export function ItemRow({
  item,
  onToggle,
  onEdit,
  onRemove,
  variant = "normal",
  showPromote = false,
  onPromote,
  promoteLabel = "승격",
  showReorder = false,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const rowRef = useRef<HTMLLIElement>(null);

  const isInverted = variant === "inverted";
  const isCompleted = isInverted ? !item.isDone : item.isDone;

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = (value: string) => {
    if (value.trim()) {
      onEdit(value.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (!isEditing) {
        e.preventDefault();
        onRemove();
      }
    }
  };

  return (
    <li
      ref={rowRef}
      role="listitem"
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50",
        isCompleted && "opacity-60"
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isInverted ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={onToggle}
          aria-label={item.isDone ? "다시 추가" : "제거"}
        >
          <X
            className={cn(
              "h-3.5 w-3.5",
              item.isDone ? "text-muted-foreground" : "text-destructive"
            )}
          />
        </Button>
      ) : (
        <Checkbox
          checked={item.isDone}
          onCheckedChange={onToggle}
          aria-label={`${item.title} 완료 표시`}
          className="shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <InlineEditor
            value={item.title}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className={cn(
              "block cursor-pointer truncate text-sm",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {item.title}
          </span>
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {item.note && (
        <Badge variant="outline" className="text-xs shrink-0">
          {item.note}
        </Badge>
      )}

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {showReorder && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveUp}
              disabled={isFirst}
              aria-label="위로 이동"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveDown}
              disabled={isLast}
              aria-label="아래로 이동"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        {showPromote && onPromote && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onPromote}
            aria-label={promoteLabel}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onRemove}
          aria-label="삭제"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}
