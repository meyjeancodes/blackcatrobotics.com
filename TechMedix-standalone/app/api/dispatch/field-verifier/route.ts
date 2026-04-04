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
import { createSupabaseServerClient as createClient } from "../../../../lib/supabase-server";
import { searchHumans, bookHuman } from "../../../../lib/blackcat/dispatch/rentahuman-client";

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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobId, humanId, taskInstructions, durationHours, budgetUsd } = body;

  if (!jobId || !humanId || !taskInstructions) {
    return NextResponse.json(
      { error: "jobId, humanId, and taskInstructions are required" },
      { status: 400 }
    );
  }

  // 1. Book via RentAHuman
  let booking;
  try {
    booking = await bookHuman(humanId, taskInstructions, durationHours ?? 2, budgetUsd ?? 150);
  } catch (err) {
    console.error("[field-verifier/POST] bookHuman error:", err);
    return NextResponse.json({ error: "RentAHuman booking failed" }, { status: 502 });
  }

  // 2. Upsert into dispatch_jobs with verifier metadata
  try {
    const supabase = await createClient();

    // Create or find an L0 technician record for this verifier
    const { data: verifierTech } = await supabase
      .from("technicians")
      .upsert(
        {
          name: `Field Verifier (${booking.humanId})`,
          region: "on-demand",
          platforms: ["field_verification"],
          rating: 4.0,
          available: false,
          eta_minutes: null,
          cert_level: "L0",
          source: "rentahuman",
          technician_type: "field_verifier",
        },
        { onConflict: "external_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    // Update dispatch job with verifier booking details
    await supabase
      .from("dispatch_jobs")
      .update({
        technician_id: verifierTech?.id ?? null,
        technician_type: "field_verifier",
        external_booking_id: booking.bookingId,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } catch (err) {
    console.error("[field-verifier/POST] Supabase update error:", err);
    // Non-fatal — still return booking confirmation
  }

  return NextResponse.json({ booking });
}
