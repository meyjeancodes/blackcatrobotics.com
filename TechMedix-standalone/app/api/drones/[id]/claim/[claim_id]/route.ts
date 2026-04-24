import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase-server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; claim_id: string }> }
) {
  const { id: droneId, claim_id } = await params;

  if (!isSupabaseServerConfigured() || !(await createSupabaseServerClient())) {
    return NextResponse.json({ error: "Supabase offline" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 503 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {
      ...(body.claim_status && { claim_status: body.claim_status }),
      ...(body.claim_type && { claim_type: body.claim_type }),
      ...(body.notes !== undefined && { notes: body.notes }),
    };

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("drone_care_refresh_claims")
      .update(updates)
      .eq("id", claim_id)
      .eq("drone_id", droneId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ claim: data });
  } catch (err) {
    console.error(`[PATCH /api/drones/${droneId}/claim/${claim_id}] error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update claim" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; claim_id: string }> }
) {
  const { id: droneId, claim_id } = await params;

  if (!isSupabaseServerConfigured() || !(await createSupabaseServerClient())) {
    return NextResponse.json({ error: "Supabase offline" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 503 });
    }

    const { error } = await supabase
      .from("drone_care_refresh_claims")
      .delete()
      .eq("id", claim_id)
      .eq("drone_id", droneId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[DELETE /api/drones/${droneId}/claim/${claim_id}] error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete claim" },
      { status: 500 }
    );
  }
}
