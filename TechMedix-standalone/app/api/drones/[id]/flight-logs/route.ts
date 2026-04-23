/**
 * GET  /api/drones/[id]/flight-logs — paginated flight logs
 * POST /api/drones/[id]/flight-logs — upload and parse a flight log
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "../../../../../lib/supabase-server";
import type { FlightLogUploadBody, FlightIncident } from "../../../../../types/dji-drone";

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return true;
  return req.cookies.getAll().some((c) => c.name.includes("auth-token"));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const offset = (page - 1) * pageSize;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: logs, error, count } = await supabase
      .from("drone_flight_logs")
      .select("*", { count: "exact" })
      .eq("drone_id", id)
      .order("flight_date", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      logs: logs ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/drones/[id]/flight-logs]", err);
    return NextResponse.json({ error: "Failed to fetch flight logs" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: FlightLogUploadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.raw_log || !body.source) {
    return NextResponse.json({ error: "raw_log and source are required" }, { status: 400 });
  }

  try {
    const parsed = parseDjiFlightLog(body.raw_log, body.source);

    const supabase = await createSupabaseServerClient();

    const { data: log, error } = await supabase
      .from("drone_flight_logs")
      .insert({
        drone_id: id,
        flight_date: parsed.flight_date,
        duration_minutes: parsed.duration_minutes,
        max_altitude_m: parsed.max_altitude_m,
        max_speed_ms: parsed.max_speed_ms,
        distance_km: parsed.distance_km,
        battery_start_pct: parsed.battery_start_pct,
        battery_end_pct: parsed.battery_end_pct,
        signal_quality_avg: parsed.signal_quality_avg,
        incidents: parsed.incidents,
        raw_log_path: null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      log,
      parsed_summary: {
        duration_min: parsed.duration_minutes,
        distance_km: parsed.distance_km,
        battery_used_pct: parsed.battery_start_pct - parsed.battery_end_pct,
        incidents_found: parsed.incidents.length,
        max_altitude_m: parsed.max_altitude_m,
        max_speed_ms: parsed.max_speed_ms,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/drones/[id]/flight-logs]", err);
    return NextResponse.json({ error: "Failed to parse or save flight log" }, { status: 500 });
  }
}

// ─── DJI Flight Log Parser ────────────────────────────────────────────────────
// Handles DJI CSV format from DJI Assistant 2 and DJI Fly App exports.
// DJI CSV columns vary by app version — we handle the common subset.

interface ParsedFlightLog {
  flight_date: string;
  duration_minutes: number;
  max_altitude_m: number;
  max_speed_ms: number;
  distance_km: number;
  battery_start_pct: number;
  battery_end_pct: number;
  signal_quality_avg: number;
  incidents: FlightIncident[];
}

function parseDjiFlightLog(raw: string, source: "dji_assistant" | "manual"): ParsedFlightLog {
  // Try JSON format first (DJI Fly export or manual input)
  if (raw.trimStart().startsWith("{") || raw.trimStart().startsWith("[")) {
    return parseJsonLog(raw);
  }

  // Parse CSV
  return parseCsvLog(raw, source);
}

function parseJsonLog(raw: string): ParsedFlightLog {
  const data = JSON.parse(raw);

  // Handle array-wrapped single entry
  const entry = Array.isArray(data) ? data[0] : data;

  return {
    flight_date: entry.flight_date ?? entry.date ?? new Date().toISOString(),
    duration_minutes: Number(entry.duration_minutes ?? entry.duration ?? 0),
    max_altitude_m: Number(entry.max_altitude_m ?? entry.max_altitude ?? 0),
    max_speed_ms: Number(entry.max_speed_ms ?? entry.max_speed ?? 0),
    distance_km: Number(entry.distance_km ?? entry.distance ?? 0),
    battery_start_pct: Number(entry.battery_start_pct ?? entry.battery_start ?? 100),
    battery_end_pct: Number(entry.battery_end_pct ?? entry.battery_end ?? 0),
    signal_quality_avg: Number(entry.signal_quality_avg ?? entry.signal_quality ?? 100),
    incidents: (entry.incidents ?? []) as FlightIncident[],
  };
}

function parseCsvLog(csv: string, source: "dji_assistant" | "manual"): ParsedFlightLog {
  const lines = csv.split("\n").filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV too short — need at least header + one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

  // DJI Assistant 2 CSV columns (common names across versions)
  const col = (name: string): number => {
    const candidates = [name, name.replace(/_/g, " "), name.replace(/_/g, "")];
    for (const c of candidates) {
      const idx = headers.findIndex((h) => h.includes(c));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  // Parse data rows
  const altitudes: number[] = [];
  const speeds: number[] = [];
  const distances: number[] = [];
  const batteries: number[] = [];
  const signals: number[] = [];
  const incidents: FlightIncident[] = [];
  let timestamps: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim().replace(/['"]/g, ""));

    const altitude = parseFloat(cells[col("altitude")] ?? cells[col("height")] ?? "0");
    const speed = parseFloat(cells[col("speed")] ?? "0");
    const distance = parseFloat(cells[col("distance")] ?? "0");
    const battery = parseFloat(cells[col("battery")] ?? cells[col("battery_percent")] ?? "0");
    const signal = parseFloat(cells[col("signal")] ?? cells[col("rc_signal")] ?? "100");
    const ts = cells[col("datetime")] ?? cells[col("time")] ?? cells[0] ?? "";

    if (!isNaN(altitude)) altitudes.push(altitude);
    if (!isNaN(speed)) speeds.push(speed);
    if (!isNaN(distance)) distances.push(distance);
    if (!isNaN(battery) && battery > 0) batteries.push(battery);
    if (!isNaN(signal)) signals.push(signal);
    if (ts) timestamps.push(ts);

    // Check for error columns
    const errCol = col("error") >= 0 ? col("error") : col("message");
    if (errCol >= 0 && cells[errCol] && cells[errCol].trim().length > 0) {
      const errMsg = cells[errCol].trim();
      if (errMsg.toLowerCase() !== "none" && errMsg !== "0" && errMsg !== "ok") {
        incidents.push({
          timestamp_s: i,
          code: `ROW_${i}`,
          message: errMsg,
          severity: errMsg.toLowerCase().includes("error") ? "error" : "warning",
        });
      }
    }

    // Flag low battery
    if (!isNaN(battery) && battery < 20 && battery > 0) {
      incidents.push({
        timestamp_s: i,
        code: "LOW_BATTERY",
        message: `Battery at ${battery.toFixed(0)}%`,
        severity: battery < 10 ? "error" : "warning",
      });
    }

    // Flag low signal
    if (!isNaN(signal) && signal < 40 && signal > 0) {
      incidents.push({
        timestamp_s: i,
        code: "LOW_SIGNAL",
        message: `Signal quality at ${signal.toFixed(0)}%`,
        severity: signal < 20 ? "error" : "warning",
      });
    }
  }

  const flightDate = timestamps[0] ? new Date(timestamps[0]).toISOString() : new Date().toISOString();
  const durationMs = timestamps.length >= 2
    ? new Date(timestamps[timestamps.length - 1]).getTime() - new Date(timestamps[0]).getTime()
    : 0;
  const durationMin = Math.round(durationMs / 60000) || (lines.length - 1); // fallback: row count as proxy

  return {
    flight_date: flightDate,
    duration_minutes: durationMin,
    max_altitude_m: altitudes.length > 0 ? Math.max(...altitudes) : 0,
    max_speed_ms: speeds.length > 0 ? Math.max(...speeds) : 0,
    distance_km: distances.length > 0 ? Math.max(...distances) / 1000 : 0,
    battery_start_pct: batteries.length > 0 ? Math.max(...batteries) : 100,
    battery_end_pct: batteries.length > 0 ? Math.min(...batteries) : 0,
    signal_quality_avg: signals.length > 0
      ? Math.round(signals.reduce((a, b) => a + b, 0) / signals.length)
      : 100,
    incidents: deduplicateIncidents(incidents),
  };
}

function deduplicateIncidents(incidents: FlightIncident[]): FlightIncident[] {
  const seen = new Set<string>();
  return incidents.filter((inc) => {
    const key = inc.code;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
