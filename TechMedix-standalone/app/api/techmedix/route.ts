/**
 * GET /api/techmedix
 * Returns full platform catalog with failure modes, protocols, and signals.
 * Optionally filtered by ?type= or ?manufacturer=
 */
import { NextRequest, NextResponse } from "next/server";
import { getPlatformCatalog, listPlatforms } from "@/lib/blackcat/knowledge/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const manufacturer = searchParams.get("manufacturer");
  const slim = searchParams.get("slim") === "1"; // slim=1 returns platforms only, no nested data

  try {
    if (slim) {
      const platforms = await listPlatforms();
      const filtered = platforms.filter((p) => {
        if (type && p.type !== type) return false;
        if (manufacturer && p.manufacturer.toLowerCase() !== manufacturer.toLowerCase()) return false;
        return true;
      });
      return NextResponse.json({ platforms: filtered, count: filtered.length });
    }

    const catalog = await getPlatformCatalog();
    const filtered = catalog.filter((p) => {
      if (type && p.type !== type) return false;
      if (manufacturer && p.manufacturer.toLowerCase() !== manufacturer.toLowerCase()) return false;
      return true;
    });

    return NextResponse.json({
      platforms: filtered,
      count: filtered.length,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[GET /api/techmedix]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
