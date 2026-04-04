/**
 * GET  /api/drones/[id]/claim — list all claims for a drone
 * POST /api/drones/[id]/claim — initiate a new care refresh claim
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabase-server";
import { checkCoverage } from "../../../../../lib/dji-care-coverage";
import type { InitiateClaimBody, CareRefreshPlan, DamageType } from "../../../../../types/dji-drone";

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return true;
  return req.cookies.getAll().some((c) => c.name.includes("auth-token"));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const supabase = await createSupabaseServerClient();

    const { data: claims, error } = await supabase
      .from("drone_care_refresh_claims")
      .select("*")
      .eq("drone_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ claims: claims ?? [] });
  } catch (err) {
    console.error("[GET /api/drones/[id]/claim]", err);
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: InitiateClaimBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { damage_type, description, flight_log_id, care_refresh_plan_check } = body;

  if (!damage_type || !description) {
    return NextResponse.json({ error: "damage_type and description are required" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Fetch drone to validate coverage
    const { data: drone, error: droneError } = await supabase
      .from("dji_drones")
      .select("*")
      .eq("id", id)
      .single();

    if (droneError || !drone) {
      return NextResponse.json({ error: "Drone not found" }, { status: 404 });
    }

    // Validate active plan
    const plan = drone.care_refresh_plan as CareRefreshPlan;
    if (plan === "NONE") {
      return NextResponse.json({
        error: "No DJI Care Refresh plan active on this drone.",
        eligible: false,
      }, { status: 422 });
    }

    // Check plan expiry
    if (
      drone.care_refresh_expires_at &&
      new Date(drone.care_refresh_expires_at) < new Date()
    ) {
      return NextResponse.json({
        error: "DJI Care Refresh plan has expired.",
        eligible: false,
      }, { status: 422 });
    }

    // Check replacements remaining
    if (drone.replacements_remaining <= 0) {
      return NextResponse.json({
        error: "No replacement units remaining on this plan.",
        eligible: false,
        replacements_used: drone.replacements_used,
        replacements_remaining: drone.replacements_remaining,
      }, { status: 422 });
    }

    // Coverage check
    const coverage = checkCoverage(plan, damage_type as DamageType, drone.model);
    if (!coverage.covered) {
      return NextResponse.json({
        error: `This damage type is not covered: ${coverage.reason}`,
        eligible: false,
        coverage_details: coverage,
      }, { status: 422 });
    }

    // Flyaway requires flight log
    if (damage_type === "FLYAWAY" && !flight_log_id) {
      return NextResponse.json({
        error: "Flyaway claims require a flight log. Please select the flight log from the incident.",
        eligible: false,
        requires_flight_log: true,
      }, { status: 422 });
    }

    // Create claim in DRAFT status
    const { data: claim, error: claimError } = await supabase
      .from("drone_care_refresh_claims")
      .insert({
        drone_id: id,
        damage_type,
        damage_description: description,
        flight_log_id: flight_log_id ?? null,
        claim_status: "DRAFT",
        photos_uploaded: [],
      })
      .select()
      .single();

    if (claimError) throw claimError;

    // Build next-step checklist
    const checklist = buildClaimChecklist(damage_type as DamageType);

    return NextResponse.json({
      claim,
      coverage,
      checklist,
      replacement_fee_usd: coverage.replacement_fee_usd,
      next_step: "Upload at least 2 photos showing the damage. Then submit the claim.",
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/drones/[id]/claim]", err);
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }
}

function buildClaimChecklist(damage_type: DamageType): string[] {
  const base = [
    "Upload minimum 2 photos showing the damage",
    "Include a photo of the drone serial number",
    "Describe the incident: date, time, location",
    "Confirm replacement fee payment will be required upon approval",
  ];

  if (damage_type === "FLYAWAY" || damage_type === "SIGNAL_LOSS") {
    return [
      "Export flight records from DJI Fly app (required for flyaway claims)",
      "Take screenshot of last known GPS location",
      ...base,
    ];
  }

  if (damage_type === "WATER") {
    return [
      "Photo showing water contact/corrosion points",
      "Describe submersion depth and duration if known",
      ...base,
    ];
  }

  return base;
}
