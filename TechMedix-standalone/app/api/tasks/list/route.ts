import { NextResponse } from "next/server";
import { createServiceClient, isSupabaseConfigured } from "../../../../lib/supabase-service";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ tasks: [], mock: true });
  }

  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ tasks: [], mock: true });
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*, robots(name, platform, status)")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({ tasks: data ?? [] });
  } catch (err) {
    console.error("[/api/tasks/list]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
