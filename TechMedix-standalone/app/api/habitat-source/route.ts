import { NextRequest, NextResponse } from "next/server";
import { sourceItems, type SourceResult } from "../../../app/habitat/design/lib/sourcing-agent";

export const runtime = "nodejs";

/**
 * POST /api/habitat-source
 * Body: { sqft?, bedrooms?, bathrooms?, features?: string[], quality_tier? }
 * Returns itemized sourced-materials pricing for the brief.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result: SourceResult = sourceItems({
      sqft: Number(body.sqft) || undefined,
      bedrooms: Number(body.bedrooms) || undefined,
      bathrooms: Number(body.bathrooms) || undefined,
      features: Array.isArray(body.features) ? body.features.map(String) : [],
      quality_tier: ["standard", "pro", "signature"].includes(body.quality_tier)
        ? body.quality_tier
        : "standard",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "sourcing failed" },
      { status: 500 }
    );
  }
}
