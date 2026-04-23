import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseConfigured } from "../../../../lib/supabase-service";
import type { TaskType, TaskStatus } from "../../../../types/blackcat";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-blackcat-secret");
  return secret === process.env.BLACKCAT_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { robot_id?: string; type?: TaskType; priority?: number; status?: TaskStatus };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { robot_id, type, priority = 2, status = "pending" } = body;

  if (!robot_id || typeof robot_id !== "string") {
    return NextResponse.json({ error: "robot_id is required" }, { status: 400 });
  }

  const validTypes: TaskType[] = ["charge", "inspect", "repair", "calibrate"];
  if (!type || !validTypes.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({ robot_id, type, priority, status })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (err) {
    console.error("[/api/tasks/create]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
