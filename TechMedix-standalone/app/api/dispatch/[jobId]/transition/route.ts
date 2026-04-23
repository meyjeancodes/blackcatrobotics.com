/**
 * POST /api/dispatch/[jobId]/transition
 * Transitions a dispatch job through its lifecycle with validation.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient as createClient, isSupabaseConfigured } from "../../../../../lib/supabase-server";

export const runtime = "nodejs";

type TargetStatus = "assigned" | "en_route" | "onsite" | "resolved";

const ALLOWED_TRANSITIONS: Record<string, TargetStatus[]> = {
  open: ["assigned"],
  assigned: ["en_route", "onsite"],
  en_route: ["onsite"],
  onsite: ["resolved"],
};

interface TransitionRequest {
  status: TargetStatus;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { jobId } = await params;

  let body: TransitionRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { status } = body;

  if (!status || !Object.keys(ALLOWED_TRANSITIONS).flat().includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be one of: assigned, en_route, onsite, resolved" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Fetch current job
    const { data: job, error: fetchErr } = await supabase
      .from("dispatch_jobs")
      .select("id, status, robot_id")
      .eq("id", jobId)
      .single();

    if (fetchErr || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 2. Validate transition
    const allowed = ALLOWED_TRANSITIONS[job.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          error: `Illegal transition: cannot go from "${job.status}" to "${status}". Allowed: [${allowed.join(", ")}]`,
        },
        { status: 409 }
      );
    }

    // 3. Update job
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: now,
    };

    const { data: updated, error: updateErr } = await supabase
      .from("dispatch_jobs")
      .update(updatePayload)
      .eq("id", jobId)
      .select("*")
      .single();

    if (updateErr) {
      console.error("[dispatch/transition] update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update job" },
        { status: 500 }
      );
    }

    // 4. If resolved, boost the robot's health_score by 5
    if (status === "resolved" && job.robot_id) {
      const { data: robot } = await supabase
        .from("robots")
        .select("health_score")
        .eq("id", job.robot_id)
        .single();

      if (robot) {
        await supabase
          .from("robots")
          .update({
            health_score: Math.min(100, (robot.health_score ?? 0) + 5),
            updated_at: now,
          })
          .eq("id", job.robot_id);
      }
    }

    return NextResponse.json({ job: updated });
  } catch (err) {
    console.error("[dispatch/transition] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
