import { NextResponse } from "next/server";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase-service";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      status_counts: { online: 4, warning: 1, service: 0, offline: 0 },
      fleet_health_avg: 92,
      total: 5,
      mock: true,
    });
  }

  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
    }
    const { data, error } = await supabase.from("robots").select("status, health_score");
    if (error) throw error;

    const robots = data ?? [];
    const status_counts = robots.reduce((acc: Record<string, number>, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

    const fleet_health_avg =
      robots.length > 0
        ? Math.round(
            robots.reduce((sum, r) => sum + (r.health_score ?? 0), 0) / robots.length
          )
        : 0;

    return NextResponse.json({ status_counts, fleet_health_avg, total: robots.length });
  } catch (err) {
    console.error("[/api/robots/stats]", err);
    return NextResponse.json({ error: "Failed to fetch robot stats" }, { status: 500 });
  }
}
