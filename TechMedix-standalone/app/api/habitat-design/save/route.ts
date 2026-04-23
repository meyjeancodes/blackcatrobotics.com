import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    params?: Record<string, unknown>;
    floor_plan_svg?: string;
    quote?: Record<string, unknown>;
    session_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name = "Untitled Design", params = {}, floor_plan_svg, quote, session_id } = body;

  const { data, error } = await supabase
    .from("designs")
    .insert({
      user_id: user.id,
      session_id: session_id || null,
      name,
      params,
      floor_plan_svg: floor_plan_svg || null,
      quote: quote || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Save design error:", error);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, success: true });
}
