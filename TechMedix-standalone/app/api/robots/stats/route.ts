import { NextResponse } from "next/server";
import { createServiceClient, isSupabaseServerConfigured } from "@/lib/supabase-service";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ status_counts: {}, fleet_health_avg: 0, total: 0, mock: true });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ status_counts: {}, fleet_health_avg: 0, total: 0, mock: true });
  }

  try {
    const { data, error } = await supabase
      .from("robots")
      .select("status, health_score");
    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ status_counts: {}, fleet_health_avg: 0, total: 0, mock: true });
    }

    const robots = data;
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
    return NextResponse.json({ status_counts: {}, fleet_health_avg: 0, total: 0, mock: true });
  }
}
