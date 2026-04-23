import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseConfigured } from "../../../../lib/supabase-service";
import { generateFleetInsight, generateEnergyInsight } from "../../../../lib/blackcat/ai/insights";
import type { BlackCatRobot, BlackCatAlert, EnergyTransaction } from "../../../../types/blackcat";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-blackcat-secret");
  return secret === process.env.BLACKCAT_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { type?: "fleet" | "energy" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type } = body;
  if (type !== "fleet" && type !== "energy") {
    return NextResponse.json(
      { error: 'type must be "fleet" or "energy"' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = createServiceClient();

    if (type === "fleet") {
      const [robotsRes, alertsRes] = await Promise.all([
        supabase.from("robots").select("*"),
        supabase.from("alerts").select("*").eq("resolved", false),
      ]);

      const robots = (robotsRes.data ?? []) as BlackCatRobot[];
      const alerts = (alertsRes.data ?? []) as BlackCatAlert[];
      const avgHealth =
        robots.length > 0
          ? Math.round(
              robots.reduce((sum, r) => sum + r.health_score, 0) / robots.length
            )
          : 0;

      const insight = await generateFleetInsight({ robots, alerts, avgHealth });
      return NextResponse.json({ insight });
    }

    // type === "energy"
    const [txRes, statesRes] = await Promise.all([
      supabase
        .from("energy_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("energy_states").select("*"),
    ]);

    const transactions = (txRes.data ?? []) as EnergyTransaction[];
    const states = statesRes.data ?? [];
    const supplyTotal = states
      .filter((s) => s.battery_level > 80)
      .reduce((sum: number, s) => sum + (s.battery_level / 100) * 10, 0);
    const demandTotal = states
      .filter((s) => s.battery_level < 30)
      .reduce((sum: number, s) => sum + ((100 - s.battery_level) / 100) * 10, 0);

    const insight = await generateEnergyInsight({
      transactions,
      supplyTotal,
      demandTotal,
    });
    return NextResponse.json({ insight });
  } catch (err) {
    console.error("[/api/ai/insight]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
