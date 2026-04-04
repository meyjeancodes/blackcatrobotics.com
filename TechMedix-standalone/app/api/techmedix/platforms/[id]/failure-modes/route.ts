/**
 * GET /api/techmedix/platforms/[id]/failure-modes
 * [id] can be a UUID or slug
 * Returns all failure modes for a platform with repair protocols + predictive signals
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getFailureModesByPlatform,
  getPlatformBySlug,
  listPlatforms,
} from "@/lib/blackcat/knowledge/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity") ?? undefined;

  try {
    // Resolve: could be UUID or slug
    let platformId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(id);
    if (!isUuid) {
      const p = await getPlatformBySlug(id);
      if (!p) {
        // try by iterating all (slug might differ from param)
        const all = await listPlatforms();
        const match = all.find((x) => x.slug === id || x.name.toLowerCase().replace(/\s+/g, "-") === id);
        if (!match) {
          return NextResponse.json({ error: "Platform not found" }, { status: 404 });
        }
        platformId = match.id;
      } else {
        platformId = p.id;
      }
    }

    const failureModes = await getFailureModesByPlatform(platformId, severity);
    return NextResponse.json({
      platform_id: platformId,
      failure_modes: failureModes,
      count: failureModes.length,
    });
  } catch (err) {
    console.error(`[GET /api/techmedix/platforms/${id}/failure-modes]`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
