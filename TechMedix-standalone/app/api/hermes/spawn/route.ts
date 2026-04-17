/**
 * POST /api/hermes/spawn
 *
 * Spawns a Hermes dispatch session for an incoming job.
 * Hermes reasons about severity/cert level using local Ollama (hermes3),
 * queues the job, and notifies all eligible BCR-certified technicians.
 */

import { NextRequest, NextResponse } from "next/server";
import { hermesDispatch } from "../../../../lib/blackcat/hermes/agent";

export const runtime = "nodejs";

interface SpawnRequest {
  jobId: string;
  workOrderId: string;
  robotId: string;
  robotName: string;
  platformId: string;
  faultCode: string;
  faultDescription?: string;
}

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  let body: SpawnRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobId, workOrderId, robotId, robotName, platformId, faultCode, faultDescription } = body;

  if (!jobId || !workOrderId || !robotId || !robotName || !platformId || !faultCode) {
    return NextResponse.json(
      { error: "jobId, workOrderId, robotId, robotName, platformId, and faultCode are required" },
      { status: 400 }
    );
  }

  // ── Supabase (optional — skipped in mock/local mode) ───────────────────────
  let supabase: any = null;
  let fmeaContext: unknown[] = [];

  if (SUPABASE_CONFIGURED) {
    try {
      const { createSupabaseServerClient } = await import("../../../../lib/supabase-server");
      supabase = await createSupabaseServerClient();

      const { data } = await supabase
        .from("fmea_records")
        .select("*")
        .eq("platform_id", platformId)
        .eq("fault_code", faultCode)
        .limit(5);
      fmeaContext = data ?? [];
    } catch (err) {
      console.warn("[hermes/spawn] Supabase unavailable — continuing without DB:", err);
    }
  } else {
    console.log("[hermes/spawn] No Supabase credentials — running in local mode.");
  }

  // ── Run Hermes dispatch ────────────────────────────────────────────────────
  let result;
  try {
    result = await hermesDispatch(supabase, {
      jobId,
      workOrderId,
      robotId,
      robotName,
      platformId,
      faultCode,
      faultDescription,
      fmeaContext,
    });
  } catch (err) {
    console.error("[hermes/spawn] Dispatch error:", err);
    return NextResponse.json({ error: "Hermes dispatch failed" }, { status: 500 });
  }

  // ── Log session (only if Supabase available) ───────────────────────────────
  if (supabase) {
    try {
      await supabase.from("hermes_sessions").insert({
        work_order_id: workOrderId,
        technician_id: "hermes",
        robot_id: robotId,
        platform_id: platformId,
        context_package: {
          reasoning: result.reasoning,
          dispatch: result.dispatch,
          fmeaContext,
        },
        agent_session_id: result.agentSessionId,
        delivery_method: "internal",
        status: result.dispatch.queued ? "queued" : "failed",
      });
    } catch (err) {
      console.error("[hermes/spawn] Session log error:", err);
    }
  }

  if (result.reasoning.escalate) {
    console.warn(
      `[hermes/spawn] ESCALATION REQUIRED — Session ${result.agentSessionId} — Severity ${result.reasoning.severity}`
    );
  }

  return NextResponse.json({
    agentSessionId: result.agentSessionId,
    severity: result.reasoning.severity,
    minCertLevel: result.reasoning.minCertLevel,
    summary: result.reasoning.summary,
    escalate: result.reasoning.escalate,
    dispatch: result.dispatch,
    mode: SUPABASE_CONFIGURED ? "live" : "local",
  });
}
