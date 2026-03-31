import { NextRequest, NextResponse } from "next/server";
import { runSimulationEngine } from "../../../../lib/blackcat/simulation/engine";

function isAuthorized(req: NextRequest): boolean {
  // POST calls use x-blackcat-secret header
  const secret = req.headers.get("x-blackcat-secret");
  if (secret && secret === process.env.BLACKCAT_API_SECRET) return true;
  // Vercel cron calls use Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  return false;
}

// GET — called by Vercel cron scheduler
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runEngine();
}

// POST — called manually with x-blackcat-secret
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runEngine();
}

async function runEngine() {
  try {
    await runSimulationEngine();
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[/api/simulation/run]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
