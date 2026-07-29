import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

/**
 * POST /api/cron/rollup-fleet
 *
 * Scheduled job: folds the device_telemetry stream into
 * failure_mode_observations (running counts + observed MTBF).
 * Protected by CRON_SECRET (set in env). Vercel cron hits this hourly.
 *
 * Also callable manually for backfills.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (expected && secret !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }

  const { error } = await supabase.rpc("rollup_fleet_observations");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rolled_up_at: new Date().toISOString() });
}
