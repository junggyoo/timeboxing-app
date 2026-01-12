"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, SkipForward, PartyPopper } from "lucide-react";
import { useTimeboxFsm } from "../hooks/use-timebox-fsm";
import { formatDuration } from "../lib/format-time";

/**
 * Modal displayed when focus session is complete (break_ready state)
 *
 * Shows:
 * - Congratulations message
 * - Total focus time
 * - Options to start break or skip
 */
export function BreakReadyModal() {
  const {
    isBreakReady,
    timeboxTitle,
    elapsedMs,
    overtimeMs,
    startBreak,
    skipBreak,
  } = useTimeboxFsm();

  if (!isBreakReady) return null;

  const totalFocusTime = elapsedMs;
  const hasOvertime = overtimeMs > 0;

  return (
    <Dialog open={isBreakReady} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-emerald-500" />
            수고하셨습니다!
          </DialogTitle>
          <DialogDescription className="pt-2">
            <span className="block">
              &quot;{timeboxTitle}&quot;을(를){" "}
              <span className="font-semibold text-foreground">
                {formatDuration(totalFocusTime)}
              </span>
              {hasOvertime && (
                <span className="text-red-500">
                  {" "}
                  (+{formatDuration(overtimeMs)} 초과)
                </span>
              )}
              {" "}만에 완료했습니다.
            </span>
            <span className="mt-2 block">
              5분 휴식을 시작할까요?
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={skipBreak}
            className="gap-2"
          >
            <SkipForward className="h-4 w-4" />
            휴식 건너뛰기
          </Button>
          <Button
            onClick={startBreak}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Coffee className="h-4 w-4" />
            휴식 시작
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
