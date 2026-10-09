import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseServerConfigured } from "@/lib/supabase-service";
import type { TaskType, TaskStatus } from "@/types/blackcat";
import { authenticateRequest } from "@/lib/techmedix/api-auth";
import { getIdempotentResponse, storeIdempotentResponse } from "@/lib/techmedix/idempotency";
import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-blackcat-secret");
  return !!secret && secret === process.env.BLACKCAT_API_SECRET;
}

export async function POST(req: NextRequest) {
  // Legacy service secret OR connector API key / dashboard session.
  const auth = await authenticateRequest(req);
  if (!auth.ok && !isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`tasks:create:POST:${auth.customerId ?? auth.via}`);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);

  // Idempotency: a retried POST with the same key returns the original
  // response instead of creating a duplicate task.
  const idempotencyKey = req.headers.get("Idempotency-Key");
  const idempotencyRoute = "POST /api/tasks/create";
  if (idempotencyKey) {
    const replay = await getIdempotentResponse(
      idempotencyKey,
      auth.customerId,
      idempotencyRoute
    );
    if (replay) {
      return NextResponse.json(replay.body, {
        status: replay.status,
        headers: { "Idempotent-Replay": "true" },
      });
    }
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

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { task: { id: `mock-${Date.now()}`, robot_id, type, priority, status }, mock: true },
      { status: 201 }
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { task: { id: `mock-${Date.now()}`, robot_id, type, priority, status }, mock: true },
      { status: 201 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({ robot_id, type, priority, status })
      .select()
      .single();

    if (error) throw new Error(error.message);
    const responseBody = { task: data };
    if (idempotencyKey) {
      await storeIdempotentResponse(
        idempotencyKey,
        auth.customerId,
        idempotencyRoute,
        201,
        responseBody
      );
    }
    return NextResponse.json(responseBody, { status: 201 });
  } catch (err) {
    console.error("[/api/tasks/create]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
