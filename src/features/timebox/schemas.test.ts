import { describe, it, expect } from "vitest";
import {
  TimeboxCreateSchema,
  TimeboxUpdateSchema,
  TimeboxStatus,
} from "./schemas";

describe("TimeboxStatus", () => {
  it("should accept valid status values", () => {
    expect(TimeboxStatus.parse("scheduled")).toBe("scheduled");
    expect(TimeboxStatus.parse("in_progress")).toBe("in_progress");
    expect(TimeboxStatus.parse("completed")).toBe("completed");
    expect(TimeboxStatus.parse("canceled")).toBe("canceled");
  });

  it("should reject invalid status values", () => {
    expect(() => TimeboxStatus.parse("invalid")).toThrow();
    expect(() => TimeboxStatus.parse("")).toThrow();
    expect(() => TimeboxStatus.parse(null)).toThrow();
  });
});

describe("TimeboxCreateSchema", () => {
  const validData = {
    title: "Deep Work Session",
    description: "Focus on MVP implementation",
    start_at: "2026-01-08T09:00:00Z",
    end_at: "2026-01-08T10:00:00Z",
    status: "scheduled" as const,
  };

  it("should accept valid timebox data", () => {
    const result = TimeboxCreateSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it("should accept minimal required fields", () => {
    const minimalData = {
      title: "Quick Task",
      start_at: "2026-01-08T09:00:00Z",
      end_at: "2026-01-08T10:00:00Z",
    };
    const result = TimeboxCreateSchema.parse(minimalData);
    expect(result).toMatchObject(minimalData);
    expect(result.description).toBeUndefined();
    expect(result.status).toBeUndefined();
  });

  it("should reject missing title", () => {
    const invalidData = {
      ...validData,
      title: undefined,
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow();
  });

  it("should reject empty title", () => {
    const invalidData = {
      ...validData,
      title: "",
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow(
      "제목은 필수입니다"
    );
  });

  it("should reject title longer than 200 characters", () => {
    const invalidData = {
      ...validData,
      title: "a".repeat(201),
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow(
      "제목은 200자 이하여야 합니다"
    );
  });

  it("should accept title exactly 200 characters", () => {
    const data = {
      ...validData,
      title: "a".repeat(200),
    };
    const result = TimeboxCreateSchema.parse(data);
    expect(result.title).toHaveLength(200);
  });

  it("should reject missing start_at", () => {
    const invalidData = {
      ...validData,
      start_at: undefined,
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow();
  });

  it("should reject invalid start_at format", () => {
    const invalidData = {
      ...validData,
      start_at: "2026-01-08",
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow(
      "올바른 시작 시간 형식이 아닙니다"
    );
  });

  it("should reject missing end_at", () => {
    const invalidData = {
      ...validData,
      end_at: undefined,
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow();
  });

  it("should reject invalid end_at format", () => {
    const invalidData = {
      ...validData,
      end_at: "2026-01-08 10:00:00",
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow(
      "올바른 종료 시간 형식이 아닙니다"
    );
  });

  it("should accept valid status values", () => {
    const statuses = [
      "scheduled",
      "in_progress",
      "completed",
      "canceled",
    ] as const;

    statuses.forEach((status) => {
      const data = { ...validData, status };
      const result = TimeboxCreateSchema.parse(data);
      expect(result.status).toBe(status);
    });
  });

  it("should reject invalid status", () => {
    const invalidData = {
      ...validData,
      status: "invalid_status",
    };
    expect(() => TimeboxCreateSchema.parse(invalidData)).toThrow();
  });
});

describe("TimeboxUpdateSchema", () => {
  it("should accept partial updates", () => {
    const partialUpdate = {
      title: "Updated Title",
    };
    const result = TimeboxUpdateSchema.parse(partialUpdate);
    expect(result).toEqual(partialUpdate);
  });

  it("should accept empty object", () => {
    const result = TimeboxUpdateSchema.parse({});
    expect(result).toEqual({});
  });

  it("should accept all fields", () => {
    const fullUpdate = {
      title: "Updated Deep Work",
      description: "Updated description",
      start_at: "2026-01-08T10:00:00Z",
      end_at: "2026-01-08T11:00:00Z",
      status: "completed" as const,
    };
    const result = TimeboxUpdateSchema.parse(fullUpdate);
    expect(result).toEqual(fullUpdate);
  });

  it("should reject invalid title (empty string)", () => {
    const invalidUpdate = {
      title: "",
    };
    expect(() => TimeboxUpdateSchema.parse(invalidUpdate)).toThrow();
  });

  it("should reject title longer than 200 characters", () => {
    const invalidUpdate = {
      title: "a".repeat(201),
    };
    expect(() => TimeboxUpdateSchema.parse(invalidUpdate)).toThrow();
  });

  it("should reject invalid datetime format", () => {
    const invalidUpdate = {
      start_at: "not-a-date",
    };
    expect(() => TimeboxUpdateSchema.parse(invalidUpdate)).toThrow();
  });

  it("should reject invalid status", () => {
    const invalidUpdate = {
      status: "invalid_status",
    };
    expect(() => TimeboxUpdateSchema.parse(invalidUpdate)).toThrow();
  });

  it("should accept valid status update", () => {
    const validUpdate = {
      status: "in_progress" as const,
    };
    const result = TimeboxUpdateSchema.parse(validUpdate);
    expect(result.status).toBe("in_progress");
  });

  it("should accept null description", () => {
    const validUpdate = {
      description: "",
    };
    const result = TimeboxUpdateSchema.parse(validUpdate);
    expect(result.description).toBe("");
  });
});
