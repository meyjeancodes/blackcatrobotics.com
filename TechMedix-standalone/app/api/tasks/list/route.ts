import { NextResponse } from "next/server";
import { createServiceClient, isSupabaseServerConfigured } from "@/lib/supabase-service";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ tasks: [], mock: true });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ tasks: [], mock: true });
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, robots(name, platform, status)")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tasks: data ?? [] });
  } catch (err) {
    console.error("[/api/tasks/list]", err);
    return NextResponse.json({ tasks: [], mock: true });
  }
}
