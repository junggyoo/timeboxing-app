import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSessionOrThrow, HttpError } from "./auth";

// Mock Next.js cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock Supabase SSR
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

// Mock env
vi.mock("@/constants/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  },
}));

describe("HttpError", () => {
  it("should create an error with status and message", () => {
    const error = new HttpError(401, "Unauthorized");
    expect(error.status).toBe(401);
    expect(error.message).toBe("Unauthorized");
    expect(error.name).toBe("HttpError");
  });

  it("should be instance of Error", () => {
    const error = new HttpError(404, "Not Found");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("getSessionOrThrow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return supabase client and user when authenticated", async () => {
    const { cookies } = await import("next/headers");
    const { createServerClient } = await import("@supabase/ssr");

    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    };

    const mockUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };

    vi.mocked(cookies).mockResolvedValue(mockCookies as any);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any);

    const result = await getSessionOrThrow();

    expect(result.user).toEqual(mockUser);
    expect(result.supabase).toBeDefined();
    expect(createServerClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        cookies: expect.any(Object),
      })
    );
  });

  it("should throw HttpError when user is not authenticated", async () => {
    const { cookies } = await import("next/headers");
    const { createServerClient } = await import("@supabase/ssr");

    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    };

    vi.mocked(cookies).mockResolvedValue(mockCookies as any);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any);

    await expect(getSessionOrThrow()).rejects.toThrow(HttpError);
    await expect(getSessionOrThrow()).rejects.toThrow("Unauthorized");
    await expect(getSessionOrThrow()).rejects.toMatchObject({ status: 401 });
  });

  it("should throw HttpError when auth.getUser returns an error", async () => {
    const { cookies } = await import("next/headers");
    const { createServerClient } = await import("@supabase/ssr");

    const mockCookies = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Invalid JWT" },
        }),
      },
    };

    vi.mocked(cookies).mockResolvedValue(mockCookies as any);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any);

    await expect(getSessionOrThrow()).rejects.toThrow(HttpError);
    await expect(getSessionOrThrow()).rejects.toMatchObject({ status: 401 });
  });
});
