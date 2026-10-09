/**
 * POST /api/dispatch/create
 * Creates a new dispatch job and auto-assigns the best available technician.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient as createClient, isSupabaseServerConfigured } from "../../../../lib/supabase-server";
import { authenticateRequest, unauthorized } from "@/lib/techmedix/api-auth";
import { getIdempotentResponse, storeIdempotentResponse } from "@/lib/techmedix/idempotency";
import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";

export const runtime = "nodejs";

interface CreateDispatchRequest {
  robotId: string;
  failureMode: string;
  description?: string;
  priority?: string;
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.ok) return unauthorized();

  const rl = checkRateLimit(`dispatch:create:POST:${auth.customerId ?? auth.via}`);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);

  // Idempotency: a retried POST with the same key returns the original
  // response instead of creating a duplicate dispatch job.
  const idempotencyKey = req.headers.get("Idempotency-Key");
  const idempotencyRoute = "POST /api/dispatch/create";
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

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let body: CreateDispatchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { robotId, failureMode, description, priority } = body;

  if (!robotId || !failureMode) {
    return NextResponse.json(
      { error: "robotId and failureMode are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Fetch robot to get platform, customer_id, and region
    const { data: robot, error: robotErr } = await supabase
      .from("robots")
      .select("id, customer_id, platform, region")
      .eq("id", robotId)
      .single();

    if (robotErr || !robot) {
      return NextResponse.json({ error: "Robot not found" }, { status: 404 });
    }

    // 2. Find best available technician — highest rating, matching platform, lowest ETA
    const { data: technicians } = await supabase
      .from("technicians")
      .select("id, name, rating, eta_minutes, platforms")
      .eq("available", true)
      .order("rating", { ascending: false })
      .order("eta_minutes", { ascending: true });

    let bestTech = null;
    if (technicians && technicians.length > 0) {
      // Prefer technician whose platforms include the robot's platform
      const matching = technicians.filter(
        (t) => Array.isArray(t.platforms) && t.platforms.includes(robot.platform)
      );
      bestTech = matching.length > 0 ? matching[0] : technicians[0];
    }

    // 3. Create dispatch job
    const now = new Date().toISOString();
    const jobPayload: Record<string, unknown> = {
      customer_id: robot.customer_id,
      robot_id: robotId,
      failure_mode: failureMode,
      description: description ?? null,
      priority: priority ?? "medium",
      status: bestTech ? "assigned" : "open",
      technician_id: bestTech?.id ?? null,
      region: robot.region,
      eta_minutes: bestTech?.eta_minutes ?? null,
      created_at: now,
      updated_at: now,
    };

    const { data: job, error: jobErr } = await supabase
      .from("dispatch_jobs")
      .insert(jobPayload)
      .select("*")
      .single();

    if (jobErr) {
      console.error("[dispatch/create] insert error:", jobErr);
      return NextResponse.json(
        { error: "Failed to create dispatch job" },
        { status: 500 }
      );
    }

    const responseBody = { job, technician: bestTech };
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
    console.error("[dispatch/create] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
