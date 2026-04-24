/**
 * Field Verifier booking API
 *
 * GET  /api/dispatch/field-verifier?lat=&lng=&radius=&skills=
 *   → returns available RentAHuman workers near the job site
 *
 * POST /api/dispatch/field-verifier
 *   → books a field verifier and records the booking on the dispatch job
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase-server";
import { searchHumans, bookHuman } from "@/lib/blackcat/dispatch/rentahuman-client";

export const runtime = "nodejs";

// ── GET — search ───────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat    = parseFloat(searchParams.get("lat")    ?? "");
  const lng    = parseFloat(searchParams.get("lng")    ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "25");
  const skills = searchParams.get("skills")?.split(",").filter(Boolean) ?? [];

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  try {
    const results = await searchHumans(lat, lng, radius, skills);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[field-verifier/GET]", err);
    return NextResponse.json({ error: "RentAHuman search failed" }, { status: 502 });
  }
}

// ── POST — book ────────────────────────────────────────────────────────────────
interface BookRequest {
  jobId: string;
  humanId: string;
  taskInstructions: string;
  durationHours: number;
  budgetUsd: number;
}

export async function POST(req: NextRequest) {
  let body: BookRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { jobId, humanId, taskInstructions, durationHours, budgetUsd } = body;
  if (!jobId || !humanId || !taskInstructions || !durationHours || !budgetUsd) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Record the booking in Supabase (best-effort — do not block Ack to RentAHuman)
  if (isSupabaseServerConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        await supabase.from("dispatch_bookings").insert({
          job_id: jobId,
          human_id: humanId,
          task_instructions: taskInstructions,
          duration_hours: durationHours,
          budget_usd: budgetUsd,
          booked_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("[field-verifier/POST] db log failed:", err);
      // Non-fatal — we still return success to the caller
    }
  }

  return NextResponse.json({ success: true });
}
