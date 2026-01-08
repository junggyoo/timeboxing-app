"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeboxStatus = "planned" | "completed" | "missed";

type TimeboxCardProps = {
  startTime: string;
  endTime: string;
  title: string;
  status?: TimeboxStatus;
  categoryColor?: string;
};

export function TimeboxCard({
  startTime,
  endTime,
  title,
  status = "planned",
  categoryColor = "#2563EB",
}: TimeboxCardProps) {
  const statusStyles = {
    planned: "bg-white border-gray-200",
    completed: "bg-green-50 border-green-200",
    missed: "bg-red-50 border-red-200",
  };

  return (
    <div
      className={cn(
        "relative min-h-[60px] rounded-lg border p-4 shadow-sm transition-all hover:shadow-md",
        statusStyles[status]
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

        {status === "completed" && (
          <div className="flex-shrink-0">
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
