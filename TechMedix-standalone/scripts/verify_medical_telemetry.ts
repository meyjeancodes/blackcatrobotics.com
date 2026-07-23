// Standalone verification of the getMedicalTelemetry data path.
// Mirrors the exact query + grouping logic in lib/data.ts getMedicalTelemetry(),
// using the anon key (medical_telemetry allows public SELECT).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, anon, { auth: { persistSession: false } });

async function main() {
  const robotId = "robot_davinci_synthetic";

  const { data: rows, error } = await supabase
    .from("medical_telemetry")
    .select("signal_name, signal_value, unit, severity, timestamp, source_device")
    .eq("robot_id", robotId)
    .order("timestamp", { ascending: true });
  if (error) throw error;

  const { data: robotRow } = await supabase
    .from("robots").select("platforms_supported").eq("id", robotId).maybeSingle();
  const slug = (robotRow?.platforms_supported as string[] | undefined)?.[0];

  const { data: adapter } = await supabase
    .from("medical_device_adapters").select("mapping_config")
    .eq("platform_slug", slug!).maybeSingle();
  const cfg = (adapter?.mapping_config as any)?.signal_mappings;
  const thresholds: Record<string, any> = {};
  for (const [, m] of Object.entries(cfg)) thresholds[(m as any).target_field] = m;

  const grouped: Record<string, any[]> = {};
  for (const r of rows as any[]) {
    const name = r.signal_name;
    (grouped[name] ??= []).push({
      signalName: name, unit: r.unit ?? thresholds[name]?.unit ?? "",
      value: Number(r.signal_value), severity: r.severity,
      timestamp: r.timestamp,
      warning: thresholds[name]?.warning ?? null, critical: thresholds[name]?.critical ?? null,
    });
  }

  const series = Object.entries(grouped).map(([name, points]) => ({
    signalName: name, unit: points[0].unit,
    warning: thresholds[name]?.warning ?? null, critical: thresholds[name]?.critical ?? null,
    points,
  }));

  console.log(`Robot: ${robotId}  Platform slug: ${slug}`);
  console.log(`Series: ${series.length}  Total points: ${rows.length}`);
  for (const s of series) {
    const last = s.points[s.points.length - 1];
    console.log(`  • ${s.signalName.padEnd(22)} unit=${s.unit.padEnd(4)} warn=${s.warning} crit=${s.critical} pts=${s.points.length} last=${last.value}/${s.unit} sev=${last.severity}`);
  }
  console.log("OK — getMedicalTelemetry shape is valid.");
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
