/**
 * GET /api/knowledge?platform=<slug>
 * GET /api/knowledge?platform=<slug>&component=<name>
 *
 * Returns failure modes and repair protocols for a given platform,
 * optionally filtered by component.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPlatformBySlug,
  getFailureModesByPlatform,
  listPlatforms,
} from "@/lib/blackcat/knowledge/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const platformSlug = searchParams.get("platform");
  const component = searchParams.get("component");

  // No platform param — return list of all supported platforms
  if (!platformSlug) {
    try {
      const platforms = await listPlatforms();
      return NextResponse.json({ platforms });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Resolve platform
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform) {
    return NextResponse.json(
      { error: `Platform '${platformSlug}' not found` },
      { status: 404 }
    );
  }

  // Fetch failure modes (with nested repair_protocols + predictive_signals)
  try {
    let failures = await getFailureModesByPlatform(platform.id);

    // Optional component filter
    if (component) {
      const needle = component.toLowerCase();
      failures = failures.filter((f) =>
        f.component.toLowerCase().includes(needle)
      );
    }

    return NextResponse.json({
      platform,
      failure_modes: failures,
      meta: {
        total: failures.length,
        critical: failures.filter((f) => f.severity === "critical").length,
        high: failures.filter((f) => f.severity === "high").length,
        low_confidence: failures.filter(
          (f) => f.confidence === "low" || f.confidence === "unverified"
        ).length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
