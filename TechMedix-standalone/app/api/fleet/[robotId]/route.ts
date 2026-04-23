/**
 * GET   /api/fleet/[robotId]  → full robot details, telemetry, alerts, jobs
 * PATCH /api/fleet/[robotId]  → partial update of robot fields
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient as createClient, isSupabaseConfigured } from "../../../../lib/supabase-server";

export const runtime = "nodejs";

// ── GET — full robot details ───────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ robotId: string }> }
) {
  const { robotId } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      robot: { id: robotId, name: "Demo Robot", platform: "Unitree G1", status: "online", health_score: 92, battery_level: 87 },
      telemetry: [],
      alerts: [],
      jobs: [],
      mock: true,
    });
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
    }

    // 1. Robot
    const { data: robot, error: robotErr } = await supabase
      .from("robots")
      .select("*")
      .eq("id", robotId)
      .single();

    if (robotErr || !robot) {
      return NextResponse.json({ error: "Robot not found" }, { status: 404 });
    }

    // 2. Telemetry history (last 50 points)
    const { data: telemetry } = await supabase
      .from("telemetry")
      .select("*")
      .eq("robot_id", robotId)
      .order("timestamp", { ascending: false })
      .limit(50);

    // 3. Active alerts
    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("robot_id", robotId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // 4. Job history
    const { data: jobs } = await supabase
      .from("dispatch_jobs")
      .select("*")
      .eq("robot_id", robotId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      robot,
      telemetry: telemetry ?? [],
      alerts: alerts ?? [],
      jobs: jobs ?? [],
    });
  } catch (err) {
    console.error("[fleet/[robotId]/GET] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── PATCH — partial update ─────────────────────────────────────────────────────
interface PatchRobotRequest {
  status?: string;
  healthScore?: number;
  batteryLevel?: number;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ robotId: string }> }
) {
  const { robotId } = await params;

  let body: PatchRobotRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { status, healthScore, batteryLevel } = body;

  // Build partial update — only include provided fields
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (status !== undefined) updates.status = status;
  if (healthScore !== undefined) updates.health_score = healthScore;
  if (batteryLevel !== undefined) updates.battery_level = batteryLevel;

  if (Object.keys(updates).length === 1) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
    }

    const { data: robot, error } = await supabase
      .from("robots")
      .update(updates)
      .eq("id", robotId)
      .select("*")
      .single();

    if (error) {
      console.error("[fleet/[robotId]/PATCH] update error:", error);
      return NextResponse.json(
        { error: "Failed to update robot" },
        { status: 500 }
      );
    }

    if (!robot) {
      return NextResponse.json({ error: "Robot not found" }, { status: 404 });
    }

    return NextResponse.json({ robot });
  } catch (err) {
    console.error("[fleet/[robotId]/PATCH] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
