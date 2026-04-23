/**
 * GET   /api/drones/[id]/claim/[claim_id] — claim detail + status
 * PATCH /api/drones/[id]/claim/[claim_id] — update claim
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseConfigured } from "../../../../../../lib/supabase-server";
import type { ClaimStatus } from "../../../../../../types/dji-drone";

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return true;
  return req.cookies.getAll().some((c) => c.name.includes("auth-token"));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; claim_id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, claim_id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: claim, error } = await supabase
      .from("drone_care_refresh_claims")
      .select("*, drone_flight_logs(*)")
      .eq("id", claim_id)
      .eq("drone_id", id)
      .single();

    if (error || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json({ claim });
  } catch (err) {
    console.error("[GET /api/drones/[id]/claim/[claim_id]]", err);
    return NextResponse.json({ error: "Failed to fetch claim" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; claim_id: string }> }
) {
  const authed = await isAuthenticated(req);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, claim_id } = await params;

  let body: {
    photos_uploaded?: string[];
    claim_status?: ClaimStatus;
    resolution_notes?: string;
    replacement_serial?: string;
    damage_description?: string;
    flight_log_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Build update — only allowed fields
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.photos_uploaded !== undefined) update.photos_uploaded = body.photos_uploaded;
    if (body.claim_status !== undefined) update.claim_status = body.claim_status;
    if (body.resolution_notes !== undefined) update.resolution_notes = body.resolution_notes;
    if (body.replacement_serial !== undefined) update.replacement_serial = body.replacement_serial;
    if (body.damage_description !== undefined) update.damage_description = body.damage_description;
    if (body.flight_log_id !== undefined) update.flight_log_id = body.flight_log_id;

    // If submitting claim, validate photos present
    if (body.claim_status === "SUBMITTED") {
      const { data: existing } = await supabase
        .from("drone_care_refresh_claims")
        .select("photos_uploaded")
        .eq("id", claim_id)
        .single();

      const photos = body.photos_uploaded ?? (existing?.photos_uploaded as string[] ?? []);
      if (photos.length < 2) {
        return NextResponse.json({
          error: "At least 2 damage photos are required before submitting a claim.",
          photos_count: photos.length,
        }, { status: 422 });
      }
    }

    const { data: claim, error } = await supabase
      .from("drone_care_refresh_claims")
      .update(update)
      .eq("id", claim_id)
      .eq("drone_id", id)
      .select()
      .single();

    if (error) throw error;

    // If claim approved and replacement shipped, decrement replacements_remaining
    if (body.claim_status === "REPLACEMENT_SHIPPED") {
      await supabase.rpc("decrement_drone_replacements", { drone_id_param: id });
    }

    return NextResponse.json({ claim });
  } catch (err) {
    console.error("[PATCH /api/drones/[id]/claim/[claim_id]]", err);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}
