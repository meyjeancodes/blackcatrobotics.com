/**
 * GET /api/ai/fleet-insight
 *
 * Public endpoint — no auth required.
 * Returns the cached fleet insight, generating a new one if stale (>5 min).
 * Safe to call from client components.
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase-service";
import { generateFleetInsight } from "../../../../lib/blackcat/ai/insights";
import type { BlackCatRobot, BlackCatAlert } from "../../../../types/blackcat";

export async function GET() {
  console.log("[/api/ai/fleet-insight] route called");
  console.log("[/api/ai/fleet-insight] ANTHROPIC_API_KEY present:", !!process.env.ANTHROPIC_API_KEY);

  try {
    const supabase = createServiceClient();

    // Clear any stale cache lock so a fresh insight can be generated
    const { error: deleteErr } = await supabase
      .from("ai_insights_cache")
      .delete()
      .eq("type", "fleet")
      .lt(
        "updated_at",
        new Date(Date.now() - 5 * 60 * 1000).toISOString()
      );
    if (deleteErr) {
      console.log("[/api/ai/fleet-insight] cache clear skipped (table may not exist):", deleteErr.message);
    } else {
      console.log("[/api/ai/fleet-insight] stale cache cleared");
    }

    // Check whether a fresh cache entry exists after the clear
    const { data: cacheRow } = await supabase
      .from("ai_insights_cache")
      .select("insight, updated_at")
      .eq("type", "fleet")
      .maybeSingle();
    console.log("[/api/ai/fleet-insight] cache hit after clear:", !!cacheRow?.insight);

    const [robotsRes, alertsRes] = await Promise.all([
      supabase.from("robots").select("*"),
      supabase.from("alerts").select("*").eq("resolved", false),
    ]);

    if (robotsRes.error) {
      console.error("[/api/ai/fleet-insight] robots query error:", robotsRes.error.message);
    }
    if (alertsRes.error) {
      console.error("[/api/ai/fleet-insight] alerts query error:", alertsRes.error.message);
    }

    const robots = (robotsRes.data ?? []) as BlackCatRobot[];
    const alerts = (alertsRes.data ?? []) as BlackCatAlert[];
    console.log("[/api/ai/fleet-insight] robots:", robots.length, "alerts:", alerts.length);

    const avgHealth =
      robots.length > 0
        ? Math.round(
            robots.reduce((sum, r) => sum + r.health_score, 0) / robots.length
          )
        : 0;

    const insight = await generateFleetInsight({ robots, alerts, avgHealth });
    console.log("[/api/ai/fleet-insight] insight generated, length:", insight.length);

    return NextResponse.json({ insight });
  } catch (err) {
    console.error("[/api/ai/fleet-insight] unhandled error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
