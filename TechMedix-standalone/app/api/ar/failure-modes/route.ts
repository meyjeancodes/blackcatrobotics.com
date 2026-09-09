import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/techmedix/memory";

export async function GET() {
  const supabase = await getSupabase();
  if (!supabase) {
    return NextResponse.json({ failureModes: [] });
  }

  const { data, error } = await supabase
    .from("failure_modes")
    .select("id, component, symptom, severity, mtbf_hours, platform:platforms(name)")
    .order("severity", { ascending: false })
    .order("platform(name)")
    .limit(200);

  if (error) {
    console.error("[ar/failure-modes] fetch error:", error);
    return NextResponse.json({ failureModes: [] });
  }

  // Flatten the platform join (may be single object or array depending on FK setup)
  const flat = (data ?? []).map((fm) => {
    const plat = fm.platform as { name: string } | { name: string }[] | null | undefined;
    const platformName =
      Array.isArray(plat) ? plat[0]?.name : plat?.name ?? "Unknown";
    return {
      id: fm.id,
      component: fm.component,
      symptom: fm.symptom,
      severity: fm.severity,
      mtbf_hours: fm.mtbf_hours,
      platform_name: platformName,
    };
  });

  return NextResponse.json({ failureModes: flat });
}
