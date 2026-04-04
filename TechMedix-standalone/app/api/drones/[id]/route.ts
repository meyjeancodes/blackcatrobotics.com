/**
 * GET    /api/drones/[id] — full drone detail
 * PATCH  /api/drones/[id] — update drone record
 * DELETE /api/drones/[id] — remove drone from fleet
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { getExpiryWarning, getCoverageSummary } from "../../../../lib/dji-care-coverage";
import type { CareRefreshPlan } from "../../../../types/dji-drone";

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

    const { data: drone, error } = await supabase
      .from("dji_drones")
      .select(`
        *,
        drone_diagnostic_reports(*),
        drone_flight_logs(*),
        drone_care_refresh_claims(*)
      `)
      .eq("id", id)
      .single();

    if (error || !drone) {
      return NextResponse.json({ error: "Drone not found" }, { status: 404 });
    }

    // Enrich with coverage info
    const plan = drone.care_refresh_plan as CareRefreshPlan;
    const coverageSummary = getCoverageSummary(plan);

    let expiryWarning = null;
    if (drone.care_refresh_expires_at) {
      expiryWarning = getExpiryWarning(new Date(drone.care_refresh_expires_at));
    }

    // Sort reports by date desc
    const reports = (drone.drone_diagnostic_reports ?? []).sort(
      (a: { generated_at: string }, b: { generated_at: string }) =>
        new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
    );

    return NextResponse.json({
      drone: {
        ...drone,
        drone_diagnostic_reports: reports,
        coverage_summary: coverageSummary,
        expiry_warning: expiryWarning,
      },
    });
  } catch (err) {
    console.error("[GET /api/drones/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch drone" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Strip fields that should not be updated directly
  const { id: _id, created_at: _created, ...updateFields } = body as Record<string, unknown> & { id?: string; created_at?: string };
  const safeUpdate = { ...updateFields, updated_at: new Date().toISOString() };

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("dji_drones")
      .update(safeUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ drone: data });
  } catch (err) {
    console.error("[PATCH /api/drones/[id]]", err);
    return NextResponse.json({ error: "Failed to update drone" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("dji_drones").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/drones/[id]]", err);
    return NextResponse.json({ error: "Failed to delete drone" }, { status: 500 });
  }
}
