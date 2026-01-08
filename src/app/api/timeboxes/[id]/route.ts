import { NextRequest, NextResponse } from "next/server";
import { getSessionOrThrow, HttpError } from "../../_utils/auth";
import { TimeboxUpdateSchema } from "@/features/timebox/schemas";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, user } = await getSessionOrThrow();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("timeboxes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Timebox not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
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

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, user } = await getSessionOrThrow();
    const { id } = await context.params;

    const body = await request.json();
    const input = TimeboxUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from("timeboxes")
      .update(input)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Timebox not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { supabase, user } = await getSessionOrThrow();
    const { id } = await context.params;

    const { error } = await supabase
      .from("timeboxes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Timebox not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return new Response(null, { status: 204 });
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
