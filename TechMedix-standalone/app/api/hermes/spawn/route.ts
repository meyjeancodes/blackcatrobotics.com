/**
 * POST /api/hermes/spawn
 *
 * Spawns an AI agent context package for a technician dispatched on a job.
 * Gathers work order, robot, platform, FMEA, and technician data, then
 * logs the context to hermes_sessions and notifies the technician via email.
 *
 * TODO: wire to real Hermes gateway once HERMES_GATEWAY_URL is configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient as createClient, isSupabaseConfigured } from "../../../../lib/supabase-server";
import { Resend } from "resend";

export const runtime = "nodejs";

interface SpawnRequest {
  workOrderId: string;
  technicianId: string;
  robotId: string;
  faultCode: string;
  platformId: string;
}

function generateSessionId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HS-${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  let body: SpawnRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { workOrderId, technicianId, robotId, faultCode, platformId } = body;

  if (!workOrderId || !technicianId || !robotId || !faultCode || !platformId) {
    return NextResponse.json(
      { error: "workOrderId, technicianId, robotId, faultCode, and platformId are required" },
      { status: 400 }
    );
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    supabase = await createClient();
  } catch (err) {
    console.error("[hermes/spawn] Supabase init error:", err);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  // ── 1. Fetch work order ────────────────────────────────────────────────────
  let workOrder: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", workOrderId)
      .single();
    workOrder = data;
  } catch {
    // Non-fatal — continue with null
  }

  // ── 2. Fetch robot + platform definition ──────────────────────────────────
  let robot: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase
      .from("robots")
      .select("*")
      .eq("id", robotId)
      .single();
    robot = data;
  } catch {
    // Non-fatal
  }

  // ── 3. Fetch FMEA data for fault code ─────────────────────────────────────
  let fmeaContext: unknown[] = [];
  try {
    const { data } = await supabase
      .from("fmea_records")
      .select("*")
      .eq("platform_id", platformId)
      .eq("fault_code", faultCode)
      .limit(5);
    fmeaContext = data ?? [];
  } catch {
    // Non-fatal
  }

  // ── 4. Fetch technician profile ───────────────────────────────────────────
  let techProfile: Record<string, unknown> | null = null;
  try {
    const { data } = await supabase
      .from("technicians")
      .select("name, email, cert_level, region, platforms, rating")
      .eq("id", technicianId)
      .single();
    techProfile = data;
  } catch {
    // Non-fatal
  }

  // ── 5. Build context package ──────────────────────────────────────────────
  const agentSessionId = generateSessionId();

  const contextPackage = {
    agentSessionId,
    workOrderId,
    robot: robot ?? { id: robotId },
    fault: { code: faultCode, platformId },
    platformDefinition: { id: platformId },
    fmeaContext,
    technicianProfile: techProfile ?? { id: technicianId },
    workOrder: workOrder ?? { id: workOrderId },
    instructions: [
      "Review the FMEA context for known failure modes matching this fault code.",
      "Perform visual inspection before any disassembly.",
      "Confirm platform power is off and LOTO applied before internal access.",
      "Log all findings in TechMedix before leaving site.",
      "Escalate to L4+ if root cause is unclear after 45 minutes on-site.",
    ],
    generatedAt: new Date().toISOString(),
  };

  // ── 6. Log to Supabase ────────────────────────────────────────────────────
  try {
    await supabase.from("hermes_sessions").insert({
      work_order_id: workOrderId,
      technician_id: technicianId,
      robot_id: robotId,
      platform_id: platformId,
      context_package: contextPackage,
      agent_session_id: agentSessionId,
      delivery_method: process.env.HERMES_GATEWAY_URL ? "gateway" : "email",
      status: "pending",
    });
  } catch (err) {
    console.error("[hermes/spawn] Session insert error:", err);
    // Non-fatal — still attempt notification
  }

  // ── 7. Send technician notification via Resend ───────────────────────────
  const contextInjected = fmeaContext.length > 0;
  const deliveryMethod = process.env.HERMES_GATEWAY_URL ? "gateway" : "email";
  const techEmail = (techProfile?.email as string) ?? null;

  if (techEmail && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const techName = (techProfile?.name as string) ?? "Technician";
      const robotName = (robot?.name as string) ?? robotId;

      await resend.emails.send({
        from: "TechMedix Dispatch <dispatch@techmedix.blackcatrobotics.com>",
        to: techEmail,
        subject: `Job Brief — ${robotName} — Fault ${faultCode}`,
        text: [
          `Hi ${techName},`,
          "",
          `You have been dispatched for work order ${workOrderId}.`,
          "",
          `Robot: ${robotName}`,
          `Platform: ${platformId}`,
          `Fault Code: ${faultCode}`,
          `Session ID: ${agentSessionId}`,
          "",
          "Instructions:",
          ...contextPackage.instructions.map((i, n) => `${n + 1}. ${i}`),
          "",
          fmeaContext.length > 0
            ? `FMEA context loaded: ${fmeaContext.length} record(s) for this fault code.`
            : "No FMEA records found for this fault code — rely on standard inspection protocol.",
          "",
          "Log all findings in TechMedix before leaving site.",
          "",
          "BlackCat Robotics — TechMedix Dispatch",
        ].join("\n"),
      });
    } catch (err) {
      console.error("[hermes/spawn] Resend error:", err);
      // Non-fatal
    }
  }

  // ── 8. TODO: wire to real Hermes gateway ─────────────────────────────────
  if (process.env.HERMES_GATEWAY_URL) {
    // Future: POST contextPackage to HERMES_GATEWAY_URL
    // const gatewayRes = await fetch(process.env.HERMES_GATEWAY_URL + "/spawn", { ... });
    console.log("[hermes/spawn] HERMES_GATEWAY_URL is set — gateway wiring pending.");
  }

  return NextResponse.json({
    agentSessionId,
    contextInjected,
    deliveryMethod,
  });
}
