/**
 * GET  /api/fleet?customerId=   → list robots with latest alert and open job
 * POST /api/fleet               → register a new robot
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient as createClient, isSupabaseConfigured } from "../../../lib/supabase-server";
import { robots as MOCK_ROBOTS, alerts as MOCK_ALERTS, jobs as MOCK_JOBS } from "../../../lib/shared/mock-data";

export const runtime = "nodejs";

// ── GET — list robots ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json(
      { error: "customerId query param is required" },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    const robots = MOCK_ROBOTS.map((r) => ({
      ...r,
      latestAlert: MOCK_ALERTS.find((a) => a.robotId === r.id && a.status === "active") ?? null,
      openJob: MOCK_JOBS.find((j) => j.robotId === r.id && !["completed", "resolved"].includes(j.status)) ?? null,
    }));
    return NextResponse.json({ robots, mock: true });
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ robots: [], mock: true });
    }

    // Fetch robots
    const { data: robots, error: robotErr } = await supabase
      .from("robots")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (robotErr) {
      console.error("[fleet/GET] robots query error:", robotErr);
      // Return mock data as fallback when query fails (schema mismatch, etc.)
      const fallbackRobots = MOCK_ROBOTS.map((r) => ({
        ...r,
        latestAlert: MOCK_ALERTS.find((a) => a.robotId === r.id && a.status === "active") ?? null,
        openJob: MOCK_JOBS.find((j) => j.robotId === r.id && !["completed", "resolved"].includes(j.status)) ?? null,
      }));
      return NextResponse.json({ robots: fallbackRobots, mock: true, query_error: true });
    }

    if (!robots || robots.length === 0) {
      return NextResponse.json({ robots: [] });
    }

    const robotIds = robots.map((r) => r.id);

    // Fetch latest active alert per robot
    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .in("robot_id", robotIds)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Fetch open jobs per robot
    const { data: jobs } = await supabase
      .from("dispatch_jobs")
      .select("*")
      .in("robot_id", robotIds)
      .in("status", ["open", "assigned", "en_route", "onsite"])
      .order("created_at", { ascending: false });

    // Build lookup maps
    const alertMap = new Map<string, unknown>();
    if (alerts) {
      for (const a of alerts) {
        if (!alertMap.has(a.robot_id)) {
          alertMap.set(a.robot_id, a);
        }
      }
    }

    const jobMap = new Map<string, unknown>();
    if (jobs) {
      for (const j of jobs) {
        if (!jobMap.has(j.robot_id)) {
          jobMap.set(j.robot_id, j);
        }
      }
    }

    const enriched = robots.map((r) => ({
      ...r,
      latestAlert: alertMap.get(r.id) ?? null,
      openJob: jobMap.get(r.id) ?? null,
    }));

    return NextResponse.json({ robots: enriched });
  } catch (err) {
    console.error("[fleet/GET] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST — register robot ──────────────────────────────────────────────────────
interface RegisterRobotRequest {
  customerId: string;
  name: string;
  platform: string;
  serialNumber: string;
  location?: string;
  region?: string;
}

export async function POST(req: NextRequest) {
  let body: RegisterRobotRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { customerId, name, platform, serialNumber, location, region } = body;

  if (!customerId || !name || !platform || !serialNumber) {
    return NextResponse.json(
      { error: "customerId, name, platform, and serialNumber are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
    }
    const now = new Date().toISOString();

    const { data: robot, error } = await supabase
      .from("robots")
      .insert({
        customer_id: customerId,
        name,
        platform,
        serial_number: serialNumber,
        location: location ?? null,
        region: region ?? null,
        status: "online",
        health_score: 100,
        battery_level: 100,
        created_at: now,
        updated_at: now,
        last_seen_at: now,
      })
      .select("*")
      .single();

    if (error) {
      console.error("[fleet/POST] insert error:", error);
      return NextResponse.json(
        { error: "Failed to register robot" },
        { status: 500 }
      );
    }

    return NextResponse.json({ robot }, { status: 201 });
  } catch (err) {
    console.error("[fleet/POST] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
