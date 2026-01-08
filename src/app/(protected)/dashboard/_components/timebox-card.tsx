"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeboxCardProps = {
  startTime: string;
  endTime: string;
  title: string;
  categoryColor?: string;
};

export function TimeboxCard({
  startTime,
  endTime,
  title,
  categoryColor = "#2563EB",
}: TimeboxCardProps) {
  return (
    <div
      className={cn(
        "relative min-h-[60px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      )}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="flex items-start gap-3 pl-2">
        <div className="flex-shrink-0 mt-0.5">
          <Clock className="h-4 w-4 text-gray-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <time className="text-sm font-medium text-gray-900">
              {startTime} - {endTime}
            </time>
          </div>
          <h3 className="text-base font-medium text-gray-900 truncate">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
