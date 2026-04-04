/**
 * GET  /api/techmedix/research/run  — Vercel cron (Mondays 03:00 UTC)
 * POST /api/techmedix/research/run  — Manual trigger (x-blackcat-secret required)
 *
 * Runs the TechMedix autonomous web research loop for all 15+ platforms.
 * Uses SERPER_API_KEY for Google Search + Claude claude-sonnet-4-6 for extraction.
 * Persists results directly to Supabase via web-researcher.ts.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  RESEARCH_PLATFORMS,
  researchPlatform,
  createAgentRun,
  completeAgentRun,
  type ResearchTarget,
} from "@/lib/blackcat/research/web-researcher";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-blackcat-secret");
  if (secret && secret === process.env.BLACKCAT_API_SECRET) return true;
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  return false;
}

// Additional platforms not yet in the registry
const EXTRA_PLATFORMS: ResearchTarget[] = [
  {
    slug: "unitree-b2",
    name: "Unitree B2",
    manufacturer: "Unitree Robotics",
    type: "quadruped",
    introduced_year: 2023,
  },
  {
    slug: "unitree-h1-2",
    name: "Unitree H1-2",
    manufacturer: "Unitree Robotics",
    type: "humanoid",
    introduced_year: 2024,
  },
  {
    slug: "tesla-optimus",
    name: "Tesla Optimus Gen2",
    manufacturer: "Tesla",
    type: "humanoid",
    introduced_year: 2024,
  },
  {
    slug: "asimov-here-be-dragons",
    name: "Asimov Here Be Dragons",
    manufacturer: "Asimov",
    type: "humanoid",
    introduced_year: 2024,
  },
  {
    slug: "dji-agras-t60",
    name: "DJI Agras T60",
    manufacturer: "DJI",
    type: "drone",
    introduced_year: 2023,
  },
  {
    slug: "radcommercial",
    name: "RadCommercial Cargo",
    manufacturer: "Rad Power Bikes",
    type: "micromobility",
    introduced_year: 2023,
  },
];

const ALL_PLATFORMS = [...RESEARCH_PLATFORMS, ...EXTRA_PLATFORMS];

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runResearch();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Allow specifying specific slugs to re-research
  let slugFilter: string[] | null = null;
  try {
    const body = await req.json();
    if (Array.isArray(body.slugs)) slugFilter = body.slugs;
  } catch {
    // no body — run all
  }
  return runResearch(slugFilter ?? undefined);
}

async function runResearch(slugFilter?: string[]) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const targets = slugFilter
    ? ALL_PLATFORMS.filter((p) => slugFilter.includes(p.slug))
    : ALL_PLATFORMS;

  let runId: string;
  try {
    runId = await createAgentRun();
  } catch {
    runId = `offline-${Date.now()}`;
  }

  const summaries = [];
  for (const platform of targets) {
    const summary = await researchPlatform(platform, runId);
    summaries.push(summary);
  }

  try {
    await completeAgentRun(runId, summaries);
  } catch (err) {
    console.error("[research/run] completeAgentRun failed:", err);
  }

  const failed = summaries.filter((s) => s.status === "failed").length;
  return NextResponse.json({
    run_id: runId,
    platforms: targets.length,
    failed,
    completed_at: new Date().toISOString(),
    summaries,
  });
}
