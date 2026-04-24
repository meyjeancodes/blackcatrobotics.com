import { NextRequest, NextResponse } from "next/server";
import { searchFieldVerifiers, bookFieldVerifier } from "../../../../lib/blackcat/dispatch/field-verifier-client";

/**
 * POST /api/dispatch/field-verifier
 *   ?action=search  → returns available field verifiers near the job site
 *   ?action=book    → books the selected verifier
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "search") {
    const lat = parseFloat(searchParams.get("lat") ?? "0");
    const lng = parseFloat(searchParams.get("lng") ?? "0");
    try {
      const results = await searchFieldVerifiers({ lat, lng });
      return NextResponse.json({ results });
    } catch {
      return NextResponse.json({ error: "Field verifier search failed" }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  try {
    // 1. Book via field verifier provider
    const booking = await bookFieldVerifier({
      verifierId: body.verifierId,
      jobId: body.jobId,
      notes: body.notes,
    });

    // 2. Return combined result
    return NextResponse.json({
      bookingId: booking.bookingId,
      status: booking.status,
      etaMin: booking.etaMin,
      source: "external",
    });
  } catch {
    return NextResponse.json({ error: "Field verifier booking failed" }, { status: 502 });
  }
}
