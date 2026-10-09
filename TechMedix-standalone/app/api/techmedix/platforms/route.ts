/**
 * GET /api/techmedix/platforms
 * Lightweight platform list for dropdowns / navigation
 */
import { NextRequest, NextResponse } from "next/server";
import { listPlatforms } from "@/lib/blackcat/knowledge/db";
import { authenticateRequest, unauthorized } from "@/lib/techmedix/api-auth";
import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.ok) return unauthorized();

  const rl = await checkRateLimit(`techmedix:platforms:GET:${auth.customerId ?? auth.via}`);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);

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
