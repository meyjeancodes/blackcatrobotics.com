import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseServerConfigured() || !(await createSupabaseServerClient())) {
    return NextResponse.json({ error: "Supabase offline" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 503 });
    }

    const body = await req.json();
    const { claim_type, notes } = body;

    const { data, error } = await supabase
      .from("drone_care_refresh_claims")
      .insert({
        drone_id: id,
        claim_type: claim_type ?? "REPLACEMENT",
        claim_status: "OPEN",
        notes: notes ?? null,
        submitted_at: new Date().toISOString(),
      })
      .select("id, claim_type, claim_status")
      .single();

    if (error) throw error;
    return NextResponse.json({ claim: data }, { status: 201 });
  } catch (err) {
    console.error(`[POST /api/drones/${id}/claim] error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create claim" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ claims: [] });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ claims: [] });
    }

    const { data, error } = await supabase
      .from("drone_care_refresh_claims")
      .select("*")
      .eq("drone_id", id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ claims: data ?? [] });
  } catch (err) {
    console.error(`[GET /api/drones/${id}/claim] error:`, err);
    return NextResponse.json({ claims: [] });
  }
}
