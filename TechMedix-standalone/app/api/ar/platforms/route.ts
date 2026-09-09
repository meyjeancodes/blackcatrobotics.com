import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/techmedix/memory";

export async function GET() {
  const supabase = await getSupabase();
  if (!supabase) {
    return NextResponse.json({ platforms: [] });
  }

  const { data, error } = await supabase
    .from("platforms")
    .select("id, name, manufacturer, slug")
    .order("name")
    .limit(100);

  if (error) {
    console.error("[ar/platforms] fetch error:", error);
    return NextResponse.json({ platforms: [] });
  }

  return NextResponse.json({ platforms: data ?? [] });
}
