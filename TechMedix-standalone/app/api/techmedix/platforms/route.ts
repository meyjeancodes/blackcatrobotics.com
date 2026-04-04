/**
 * GET /api/techmedix/platforms
 * Lightweight platform list for dropdowns / navigation
 */
import { NextRequest, NextResponse } from "next/server";
import { listPlatforms } from "@/lib/blackcat/knowledge/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    const platforms = await listPlatforms();
    const filtered = type ? platforms.filter((p) => p.type === type) : platforms;
    return NextResponse.json({ platforms: filtered });
  } catch (err) {
    console.error("[GET /api/techmedix/platforms]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
