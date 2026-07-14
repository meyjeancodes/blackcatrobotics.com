/**
 * POST /api/techmedix/research/ingest  — Curated document ingestion (Phase B)
 *
 * Feeds high-quality curated sources (OEM service manuals, Reddit/forum thread
 * exports, teardown write-ups) into the Knowledge Moat. Reuses the SAME extraction
 * + Supabase persistence pipeline as the web-research cron, but the source material
 * is supplied rather than web-searched (bypasses weak public-web search).
 *
 * Body:
 * {
 *   "slug": "unitree_g1",
 *   "documents": [
 *     { "title": "...", "content": "...full text...",
 *       "source_url": "https://...", "source_type": "manual|forum|teardown|patent|other" }
 *   ]
 * }
 *
 * Auth: x-blackcat-secret (same as /run) required.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  RESEARCH_PLATFORMS,
  ingestDocuments,
  createAgentRun,
  completeAgentRun,
  type ResearchTarget,
  type IngestDocument,
} from "@/lib/blackcat/research/web-researcher";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-blackcat-secret");
  if (secret && secret === process.env.BLACKCAT_API_SECRET) return true;
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: string; documents?: IngestDocument[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, documents } = body;
  if (!slug || !Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json(
      { error: "Body must include 'slug' and a non-empty 'documents' array" },
      { status: 400 }
    );
  }

  // Resolve the platform. Prefer the registry; otherwise build a minimal target
  // from the slug so ad-hoc platforms can be ingested without code changes.
  const known = RESEARCH_PLATFORMS.find((p) => p.slug === slug);
  const platform: ResearchTarget =
    known ??
    {
      slug,
      name: slug.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      manufacturer: "Unknown",
      type: "other",
    };

  let runId: string;
  try {
    runId = await createAgentRun();
  } catch {
    runId = `offline-${Date.now()}`;
  }

  const summary = await ingestDocuments(platform, documents, runId);

  try {
    await completeAgentRun(runId, [summary]);
  } catch (err) {
    console.error("[research/ingest] completeAgentRun failed:", err);
  }

  return NextResponse.json({
    run_id: runId,
    platforms: 1,
    failed: summary.status === "failed" ? 1 : 0,
    completed_at: new Date().toISOString(),
    summaries: [summary],
  });
}
