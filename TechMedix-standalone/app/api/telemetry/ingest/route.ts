import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

/**
 * POST /api/telemetry/ingest
 *
 * Device → TechMedix telemetry ingest (the "fleet-learning" firehose).
 * Devices authenticate with a shared bearer token: TELEMETRY_API_KEY.
 *
 * Body (all fields except serial_number optional):
 * {
 *   "serial_number":  "SERVE-0001",          // required — identifies the physical unit
 *   "platform_slug":  "serve-rs2",           // required only on first sight (to create the unit)
 *   "status":         "active",              // active|idle|maintenance|retired|lost
 *   "event_type":     "metric",              // heartbeat|status|metric|error|maintenance
 *   "event_code":     "E-0421",              // optional fault/event code
 *   "failure_mode_id":"<uuid>",              // optional — tag to a known failure mode
 *   "severity":       "high",                // critical|high|medium|low|info
 *   "metric_name":    "motor_temp_c",        // for metric events
 *   "metric_value":   42.5,
 *   "metric_unit":    "C",
 *   "firmware_version":"2.1.0",
 *   "payload":        { "extra": "data" },   // free-form JSON
 *   "reported_at":    "2026-07-27T10:00:00Z" // optional; defaults to now
 * }
 *
 * First time a serial is seen it is registered in device_inventory
 * (linked to the platform resolved from platform_slug). Every call also
 * appends a row to device_telemetry.
 */

type IngestBody = {
  serial_number: string;
  platform_slug?: string;
  status?: string;
  event_type?: string;
  event_code?: string;
  failure_mode_id?: string;
  severity?: string;
  metric_name?: string;
  metric_value?: number;
  metric_unit?: string;
  firmware_version?: string;
  payload?: Record<string, unknown>;
  reported_at?: string;
};

const VALID_STATUSES = ["active", "idle", "maintenance", "retired", "lost"];
const VALID_EVENTS = ["heartbeat", "status", "metric", "error", "maintenance"];
const VALID_SEVERITIES = ["critical", "high", "medium", "low", "info"];

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const expected = process.env.TELEMETRY_API_KEY;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── Parse + validate ──────────────────────────────────────────────
  let body: IngestBody;
  try {
    body = (await req.json()) as IngestBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const serial = body.serial_number?.trim();
  if (!serial) {
    return NextResponse.json({ error: "serial_number required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "telemetry service unavailable" }, { status: 503 });
  }

  // ── Resolve device (create if first sight) ────────────────────────
  const { data: existing } = await supabase
    .from("device_inventory")
    .select("id, platform_id")
    .eq("serial_number", serial)
    .maybeSingle();

  let deviceId = existing?.id;

  if (!deviceId) {
    // Need a platform to register the unit.
    if (!body.platform_slug) {
      return NextResponse.json(
        { error: "unknown device; provide platform_slug on first report" },
        { status: 422 },
      );
    }
    const { data: platform, error: pErr } = await supabase
      .from("platforms")
      .select("id")
      .eq("slug", body.platform_slug)
      .maybeSingle();
    if (pErr || !platform) {
      return NextResponse.json(
        { error: `platform not found: ${body.platform_slug}` },
        { status: 422 },
      );
    }

    const status = VALID_STATUSES.includes(body.status ?? "") ? body.status! : "active";
    const { data: created, error: cErr } = await supabase
      .from("device_inventory")
      .insert({
        platform_id: platform.id,
        serial_number: serial,
        status,
        firmware_version: body.firmware_version ?? null,
        last_seen_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (cErr || !created) {
      return NextResponse.json({ error: cErr?.message ?? "insert failed" }, { status: 500 });
    }
    deviceId = created.id;
  } else {
    // Touch last_seen + optional status/firmware update.
    const patch: Record<string, unknown> = { last_seen_at: new Date().toISOString() };
    if (body.status && VALID_STATUSES.includes(body.status)) patch.status = body.status;
    if (body.firmware_version) patch.firmware_version = body.firmware_version;
    await supabase.from("device_inventory").update(patch).eq("id", deviceId);
  }

  // ── Append telemetry row ──────────────────────────────────────────
  const eventType = VALID_EVENTS.includes(body.event_type ?? "") ? body.event_type! : "status";
  const severity = VALID_SEVERITIES.includes(body.severity ?? "") ? body.severity! : "info";

  const { error: tErr } = await supabase.from("device_telemetry").insert({
    device_id: deviceId,
    failure_mode_id: body.failure_mode_id ?? null,
    event_type: eventType,
    severity,
    event_code: body.event_code ?? null,
    metric_name: body.metric_name ?? null,
    metric_value: body.metric_value ?? null,
    metric_unit: body.metric_unit ?? null,
    payload: body.payload ?? {},
    source: "device",
    reported_at: body.reported_at ?? new Date().toISOString(),
  });
  if (tErr) {
    return NextResponse.json({ error: tErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, device_id: deviceId });
}
