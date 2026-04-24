/**
 * GET  /api/drones  — list all drones with health scores + care refresh status
 * POST /api/drones  — register a new drone
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { getExpiryWarning } from "../../../lib/dji-care-coverage";
import type { RegisterDroneBody, CareRefreshPlan } from "../../../types/dji-drone";

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return true;
  return req.cookies.getAll().some((c) => c.name.includes("auth-token"));
}

export async function GET(req: NextRequest) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ drones: [], mock: true });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ drones: [], mock: true });
    }

    const { data: drones, error } = await supabase
      .from("dji_drones")
      .select(`
        *,
        drone_diagnostic_reports(overall_health_score, generated_at),
        drone_flight_logs(flight_date),
        drone_care_refresh_claims(id, claim_status)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich with computed fields
    const enriched = (drones ?? []).map((drone: Record<string, unknown>) => {
      const reports = drone.drone_diagnostic_reports as { overall_health_score: number; generated_at: string }[] | null;
      const logs = drone.drone_flight_logs as { flight_date: string }[] | null;
      const claims = drone.drone_care_refresh_claims as { id: string; claim_status: string }[] | null;

      const latestReport = reports
        ?.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0];
      const lastFlight = logs
        ?.sort((a, b) => new Date(b.flight_date).getTime() - new Date(a.flight_date).getTime())[0];

      const openClaims = (claims ?? []).filter(
        (c) => !["CLOSED", "DENIED"].includes(c.claim_status)
      ).length;

      // Compute expiry warning
      let expiryWarning = null;
      if (drone.care_refresh_expires_at) {
        expiryWarning = getExpiryWarning(new Date(drone.care_refresh_expires_at as string));
      }

      return {
        ...drone,
        latest_health_score: latestReport?.overall_health_score ?? null,
        last_flight_date: lastFlight?.flight_date ?? null,
        active_alerts_count: openClaims,
        expiry_warning: expiryWarning,
        drone_diagnostic_reports: undefined,
        drone_flight_logs: undefined,
        drone_care_refresh_claims: undefined,
      };
    });

    return NextResponse.json({ drones: enriched }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/drones]", err);
    return NextResponse.json({ drones: [], mock: true });
  }
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseServerConfigured() || !(await createSupabaseServerClient())) {
    return NextResponse.json({ error: "Cannot register drone — Supabase is offline" }, { status: 503 });
  }

  let body: RegisterDroneBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { serial_number, model, purchase_date, care_refresh_plan, care_refresh_activated_at, fleet_id } = body;

  if (!serial_number || !model || !purchase_date) {
    return NextResponse.json({ error: "serial_number, model, and purchase_date are required" }, { status: 400 });
  }

  // Compute care refresh expiry and replacements
  let expires_at: string | null = null;
  let replacements_remaining = 0;

  if (care_refresh_plan !== "NONE" && care_refresh_activated_at) {
    const activated = new Date(care_refresh_activated_at);
    const months = care_refresh_plan === "TWO_YEAR" ? 24 : 12;
    const expiry = new Date(activated);
    expiry.setMonth(expiry.getMonth() + months);
    expires_at = expiry.toISOString();

    replacements_remaining =
      care_refresh_plan === "TWO_YEAR" ? 3 : 2;
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("dji_drones")
      .insert({
        serial_number,
        model,
        purchase_date,
        care_refresh_plan: care_refresh_plan as CareRefreshPlan ?? "NONE",
        care_refresh_activated_at: care_refresh_activated_at ?? null,
        care_refresh_expires_at: expires_at,
        replacements_used: 0,
        replacements_remaining,
        fleet_id: fleet_id ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ drone: data }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/drones]", err);
    return NextResponse.json({ error: "Failed to register drone" }, { status: 500 });
  }
}
