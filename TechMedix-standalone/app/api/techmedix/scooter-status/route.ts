import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Find VEO S1 scooter platform by matching known seed values
    const { data: platforms, error: platformError } = await supabase
      .from("platforms")
      .select("*")
      .eq("motor_power_w", 350)
      .eq("top_speed_kmh", 30)
      .eq("range_km", 25)
      .limit(1)
      .maybeSingle();

    if (platformError || !platforms) {
      return NextResponse.json({ error: "Scooter platform not found" }, { status: 404 });
    }

    const platform = platforms;

    const { data: failureModes, error: failureError } = await supabase
      .from("failure_modes")
      .select("*, predictive_signals(*), repair_protocols(*)")
      .eq("platform_id", platform.id)
      .order("severity", { ascending: true });

    const failure_modes = (failureModes ?? []) as Array<Record<string, unknown>>;

    const summary = {
      platform: {
        id: platform.id,
        name: "VEO Micromobility S1",
        category: "scooter",
        motor_power_w: platform.motor_power_w,
        top_speed_kmh: platform.top_speed_kmh,
        range_km: platform.range_km,
      },
      failure_modes: failure_modes.map((fm) => ({
        id: fm.id,
        code: (fm as Record<string, unknown>)["code"] ?? null,
        name: fm.name,
        severity: fm.severity,
        detection_signals: (fm as Record<string, unknown>)["detection_signals"] ?? [],
        repair_protocols: (fm as Record<string, unknown>)["repair_protocols"] ?? [],
        predictive_signals: (fm as Record<string, unknown>)["predictive_signals"] ?? [],
      })),
      meta: {
        total_failures: failure_modes.length,
        critical: failure_modes.filter((f) => f.severity === "critical").length,
        high: failure_modes.filter((f) => f.severity === "high").length,
      },
    };

    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
