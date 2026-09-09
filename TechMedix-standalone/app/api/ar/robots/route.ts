import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/techmedix/memory";

export async function GET() {
  const supabase = await getSupabase();
  if (!supabase) {
    return NextResponse.json({ robots: [] });
  }

  const { data, error } = await supabase
    .from("robots")
    .select("id, name, platform, status")
    .eq("status", "online")
    .order("name")
    .limit(50);

  if (error) {
    console.error("[ar/robots] fetch error:", error);
    return NextResponse.json({ robots: [] });
  }

  // Group by robot name for cleaner display — pick the first online entry per name
  const seen = new Map<string, typeof data[0]>();
  for (const r of (data ?? [])) {
    if (!seen.has(r.name)) seen.set(r.name, r);
  }

  return NextResponse.json({ robots: Array.from(seen.values()) });
}
