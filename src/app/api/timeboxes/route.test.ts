import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// Mock the auth utility
vi.mock("../_utils/auth", () => ({
  getSessionOrThrow: vi.fn(),
  HttpError: class HttpError extends Error {
    constructor(
      public status: number,
      message: string
    ) {
      super(message);
      this.name = "HttpError";
    }
  },
}));

describe("GET /api/timeboxes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return timeboxes for authenticated user", async () => {
    const { getSessionOrThrow } = await import("../_utils/auth");

    const mockTimeboxes = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Deep Work",
        description: "Focus session",
        start_at: "2026-01-08T09:00:00Z",
        end_at: "2026-01-08T10:00:00Z",
        duration_minutes: 60,
        status: "scheduled",
        created_at: "2026-01-08T08:00:00Z",
        updated_at: "2026-01-08T08:00:00Z",
      },
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockTimeboxes,
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(getSessionOrThrow).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "123e4567-e89b-12d3-a456-426614174000" } as any,
    });

    const request = new NextRequest("http://localhost:3000/api/timeboxes");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTimeboxes);
    expect(mockSupabase.from).toHaveBeenCalledWith("timeboxes");
  });

  it("should apply limit parameter", async () => {
    const { getSessionOrThrow } = await import("../_utils/auth");

    const limitMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
    const eqMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({ select: selectMock }),
    };

    vi.mocked(getSessionOrThrow).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "123e4567-e89b-12d3-a456-426614174000" } as any,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/timeboxes?limit=10"
    );
    await GET(request);

    expect(limitMock).toHaveBeenCalledWith(10);
  });

  it("should return 401 when not authenticated", async () => {
    const { getSessionOrThrow, HttpError } = await import("../_utils/auth");

    vi.mocked(getSessionOrThrow).mockRejectedValue(
      new HttpError(401, "Unauthorized")
    );

    const request = new NextRequest("http://localhost:3000/api/timeboxes");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 500 on database error", async () => {
    const { getSessionOrThrow } = await import("../_utils/auth");

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            }),
          }),
        }),
      }),
    };

    vi.mocked(getSessionOrThrow).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "123e4567-e89b-12d3-a456-426614174000" } as any,
    });

    const request = new NextRequest("http://localhost:3000/api/timeboxes");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database error");
  });
});

describe("POST /api/timeboxes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create timebox for authenticated user", async () => {
    const { getSessionOrThrow } = await import("../_utils/auth");

    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const requestBody = {
      title: "Deep Work",
      description: "Focus session",
      start_at: "2026-01-08T09:00:00Z",
      end_at: "2026-01-08T10:00:00Z",
      status: "scheduled",
    };

    const createdTimebox = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: userId,
      ...requestBody,
      duration_minutes: 60,
      created_at: "2026-01-08T08:00:00Z",
      updated_at: "2026-01-08T08:00:00Z",
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: createdTimebox,
              error: null,
            }),
          }),
        }),
      }),
    };

    vi.mocked(getSessionOrThrow).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: userId } as any,
    });

    const request = new NextRequest("http://localhost:3000/api/timeboxes", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(createdTimebox);
    expect(mockSupabase.from).toHaveBeenCalledWith("timeboxes");
  });

  it("should return 400 on validation error", async () => {
    const { getSessionOrThrow } = await import("../_utils/auth");

    const mockSupabase = {
      from: vi.fn(),
    };

    vi.mocked(getSessionOrThrow).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "123e4567-e89b-12d3-a456-426614174000" } as any,
    });

    const invalidBody = {
      title: "", // Invalid: empty title
      start_at: "2026-01-08T09:00:00Z",
      end_at: "2026-01-08T10:00:00Z",
    };

    const request = new NextRequest("http://localhost:3000/api/timeboxes", {
      method: "POST",
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation error");
    expect(data.details).toBeDefined();
  });

  it("should return 401 when not authenticated", async () => {
    const { getSessionOrThrow, HttpError } = await import("../_utils/auth");

    vi.mocked(getSessionOrThrow).mockRejectedValue(
      new HttpError(401, "Unauthorized")
    );

    const requestBody = {
      title: "Deep Work",
      start_at: "2026-01-08T09:00:00Z",
      end_at: "2026-01-08T10:00:00Z",
    };

    const request = new NextRequest("http://localhost:3000/api/timeboxes", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 on database error", async () => {
    const { getSessionOrThrow } = await import("../_utils/auth");

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database constraint violation" },
            }),
          }),
        }),
      }),
    };

    vi.mocked(getSessionOrThrow).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "123e4567-e89b-12d3-a456-426614174000" } as any,
    });

    const requestBody = {
      title: "Deep Work",
      start_at: "2026-01-08T09:00:00Z",
      end_at: "2026-01-08T10:00:00Z",
    };

    const request = new NextRequest("http://localhost:3000/api/timeboxes", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Database constraint violation");
  });
});
