/**
 * POST /api/knowledge/research
 * Body: { platform: string }   — platform slug, e.g. "unitree_g1"
 *
 * Triggers the research agent for the given platform.
 * Returns a job ID immediately; research runs in the background.
 *
 * NOTE: In production this should be moved to a Supabase Edge Function or
 * background job queue. For now it awaits the research synchronously to
 * keep deployment simple (Vercel functions have a 60s timeout on hobby,
 * 300s on pro — sufficient for a single platform run).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  researchPlatform,
  createAgentRun,
  completeAgentRun,
  RESEARCH_PLATFORMS,
} from "@/lib/blackcat/research/web-researcher";

export const dynamic = "force-dynamic";
// Allow up to 300s for pro Vercel plans (single platform research)
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: { platform?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const platformSlug = body.platform?.trim();
  if (!platformSlug) {
    return NextResponse.json(
      { error: "Missing required field: platform" },
      { status: 400 }
    );
  }

  const target = RESEARCH_PLATFORMS.find((p) => p.slug === platformSlug);
  if (!target) {
    return NextResponse.json(
      {
        error: `Unknown platform slug '${platformSlug}'`,
        known_platforms: RESEARCH_PLATFORMS.map((p) => p.slug),
      },
      { status: 404 }
    );
  }

  // Create agent run record
  let runId: string;
  try {
    runId = await createAgentRun();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create agent run: ${message}` },
      { status: 500 }
    );
  }

  // Run research (awaited — suitable for single-platform POST requests)
  const summary = await researchPlatform(target, runId);

  // Finalize run record
  await completeAgentRun(runId, [summary]);

  const statusCode = summary.status === "failed" ? 500 : 200;
  return NextResponse.json(
    {
      run_id: runId,
      summary,
    },
    { status: statusCode }
  );
}
