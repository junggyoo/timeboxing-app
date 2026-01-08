import { NextRequest, NextResponse } from "next/server";
import { getSessionOrThrow, HttpError } from "../_utils/auth";
import { TimeboxCreateSchema } from "@/features/timebox/schemas";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await getSessionOrThrow();

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query = supabase
      .from("timeboxes")
      .select("*")
      .eq("user_id", user.id)
      .order("start_at", { ascending: true })
      .limit(limit);

    if (from) {
      query = query.gte("start_at", from);
    }

    if (to) {
      query = query.lte("end_at", to);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getSessionOrThrow();

    const body = await request.json();
    const input = TimeboxCreateSchema.parse(body);

    const { data, error } = await supabase
      .from("timeboxes")
      .insert({
        ...input,
        user_id: user.id,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
