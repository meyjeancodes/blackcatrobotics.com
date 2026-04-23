/**
 * GET /api/drones/fleet-health
 * Aggregate fleet health dashboard data.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "../../../../lib/supabase-server";
import { MOCK_FLEET_HEALTH } from "../../../../lib/drone-mock-data";

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  return req.cookies.getAll().some((c) => c.name.includes("auth-token"));
}

export async function GET(req: NextRequest) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ...MOCK_FLEET_HEALTH, mock: true });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ ...MOCK_FLEET_HEALTH, mock: true });
    }

    // Fetch all drones with their latest diagnostic
    const { data: drones, error: dronesError } = await supabase
      .from("dji_drones")
      .select("*, drone_diagnostic_reports(overall_health_score, generated_at)");

    if (dronesError) throw dronesError;

    // Fetch open claims count
    const { count: openClaims, error: claimsError } = await supabase
      .from("drone_care_refresh_claims")
      .select("id", { count: "exact", head: true })
      .not("claim_status", "in", '("CLOSED","DENIED")');

    if (claimsError) throw claimsError;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let totalHealthScore = 0;
    let healthCount = 0;
    let activeCareFresh = 0;
    let replacementsUsed = 0;
    const expiringSoon: unknown[] = [];
    const healthDistribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    const requiresAttention: unknown[] = [];

    for (const drone of drones ?? []) {
      // Care Refresh active check
      if (
        drone.care_refresh_plan !== "NONE" &&
        drone.care_refresh_expires_at &&
        new Date(drone.care_refresh_expires_at) > now
      ) {
        activeCareFresh++;

        // Expiring soon
        if (new Date(drone.care_refresh_expires_at) <= thirtyDaysFromNow) {
          expiringSoon.push(drone);
        }
      }

      replacementsUsed += drone.replacements_used ?? 0;

      // Latest health score
      const reports = drone.drone_diagnostic_reports as { overall_health_score: number; generated_at: string }[] | null;
      const latestScore = reports
        ?.sort((a: { generated_at: string }, b: { generated_at: string }) =>
          new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
        )[0]?.overall_health_score ?? null;

      if (latestScore !== null) {
        totalHealthScore += latestScore;
        healthCount++;

        if (latestScore > 80) healthDistribution.excellent++;
        else if (latestScore >= 60) healthDistribution.good++;
        else if (latestScore >= 40) healthDistribution.fair++;
        else healthDistribution.poor++;

        if (latestScore < 60) {
          requiresAttention.push({ ...drone, latest_health_score: latestScore });
        }
      }
    }

    return NextResponse.json({
      total_drones: drones?.length ?? 0,
      active_care_refresh: activeCareFresh,
      expiring_soon: expiringSoon,
      health_distribution: healthDistribution,
      open_claims: openClaims ?? 0,
      drones_requiring_attention: requiresAttention,
      fleet_health_score: healthCount > 0 ? Math.round(totalHealthScore / healthCount) : 0,
      replacement_units_used_this_period: replacementsUsed,
    });
  } catch (err) {
    console.error("[GET /api/drones/fleet-health]", err);
    return NextResponse.json({ error: "Failed to fetch fleet health" }, { status: 500 });
  }
}
