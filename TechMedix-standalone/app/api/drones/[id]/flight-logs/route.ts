import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ flight_logs: [] });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ flight_logs: [] });
    }

    const { data, error } = await supabase
      .from("drone_flight_logs")
      .select("*")
      .eq("drone_id", id)
      .order("flight_date", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ flight_logs: data ?? [] });
  } catch (err) {
    console.error(`[GET /api/drones/${id}/flight-logs] error:`, err);
    return NextResponse.json({ flight_logs: [] });
  }
}

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
    const { error } = await supabase
      .from("drone_flight_logs")
      .insert({
        drone_id: id,
        flight_date: body.flight_date ?? new Date().toISOString().split("T")[0],
        notes: body.notes ?? null,
        ...(body.duration_minutes && { duration_minutes: body.duration_minutes }),
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(`[POST /api/drones/${id}/flight-logs] error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to log flight" },
      { status: 500 }
    );
  }
}
