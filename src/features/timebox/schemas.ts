import { z } from "zod";

export const TimeboxStatus = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "canceled",
]);

export const TimeboxCreateSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다").max(200, "제목은 200자 이하여야 합니다"),
  description: z.string().optional(),
  start_at: z.string().datetime({ message: "올바른 시작 시간 형식이 아닙니다" }),
  end_at: z.string().datetime({ message: "올바른 종료 시간 형식이 아닙니다" }),
  status: TimeboxStatus.optional(),
});

export const TimeboxUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  status: TimeboxStatus.optional(),
});

export type TimeboxCreate = z.infer<typeof TimeboxCreateSchema>;
export type TimeboxUpdate = z.infer<typeof TimeboxUpdateSchema>;
