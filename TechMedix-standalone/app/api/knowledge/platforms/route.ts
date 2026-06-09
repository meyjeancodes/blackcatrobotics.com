import { NextResponse } from "next/server";
import { getPlatformsFromSupabase } from "@/lib/knowledge/platforms-server";

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const platforms = await getPlatformsFromSupabase();

    if (platforms.length === 0) {
      return NextResponse.json(
        { platforms: [], source: "supabase-empty" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { platforms, source: "supabase" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/knowledge/platforms] Error:", error);
    return NextResponse.json(
      { platforms: [], source: "error", error: "Failed to fetch" },
      { status: 500 }
    );
  }
}