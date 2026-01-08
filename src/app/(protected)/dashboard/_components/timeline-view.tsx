"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeboxCard } from "./timebox-card";
import { CreateTimeboxDialog } from "./create-timebox-dialog";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

const DUMMY_TIMEBOXES = [
  {
    id: "1",
    startTime: "10:00",
    endTime: "11:30",
    title: "주간 보고서 작성",
    status: "planned" as const,
  },
  {
    id: "2",
    startTime: "13:00",
    endTime: "15:00",
    title: "팀 미팅 및 브레인스토밍",
    status: "planned" as const,
  },
  {
    id: "3",
    startTime: "16:30",
    endTime: "17:00",
    title: "이메일 확인 및 회신",
    status: "planned" as const,
  },
];

export function TimelineView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">오늘의 일정</h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <Button
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />새 타임박스
        </Button>
      </div>

      <CreateTimeboxDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {HOURS.map((hour) => {
              const hourString = `${hour.toString().padStart(2, "0")}:00`;
              const timeboxesAtHour = DUMMY_TIMEBOXES.filter((tb) => {
                const tbHour = parseInt(tb.startTime.split(":")[0]);
                return tbHour === hour;
              });

              return (
                <div key={hour} className="relative flex gap-4 mb-4">
                  <div className="w-20 flex-shrink-0 pt-1">
                    <time className="text-sm font-medium text-gray-500">
                      {hourString}
                    </time>
                  </div>

                  <div className="flex-1 min-h-[60px] relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

                    <div className="pl-4 space-y-2">
                      {timeboxesAtHour.length > 0 ? (
                        <>
                          {timeboxesAtHour.map((timebox) => (
                            <TimeboxCard
                              key={timebox.id}
                              startTime={timebox.startTime}
                              endTime={timebox.endTime}
                              title={timebox.title}
                              status={timebox.status}
                            />
                          ))}
                        </>
                      ) : (
                        <div className="h-full min-h-[60px]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
