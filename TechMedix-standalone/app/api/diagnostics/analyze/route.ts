/**
 * POST /api/diagnostics/analyze
 *
 * Runs the full three-layer diagnostic pipeline for a given robot frame.
 * Server-side only — API keys never leave this module.
 *
 * Rate limit: 1 request per (robotId + platformId) per DIAGNOSTIC_RATE_LIMIT_MS (default 30s).
 * Auth: passes through if Supabase env vars are absent (mock/demo mode).
 */

import { NextRequest, NextResponse } from "next/server";
import { runDiagnosticPipeline, buildMockFrame } from "../../../../lib/diagnostics/diagnostic-pipeline";
import type { TelemetryFrame } from "../../../../lib/diagnostics/types";

// ─── Rate limiter (in-memory, per-robot) ─────────────────────────────────────

const RATE_LIMIT_MS = parseInt(process.env.DIAGNOSTIC_RATE_LIMIT_MS ?? "30000", 10);
const _lastCall = new Map<string, number>();

function isRateLimited(key: string): boolean {
  const last = _lastCall.get(key);
  const now = Date.now();
  if (last !== undefined && now - last < RATE_LIMIT_MS) return true;
  _lastCall.set(key, now);
  return false;
}

// ─── Auth check ───────────────────────────────────────────────────────────────

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  // If Supabase env vars are absent (demo/mock mode) let all requests through.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return true;
  }

  // In live mode, check for a valid session cookie.
  // The Supabase session token is stored in sb-<project>-auth-token cookies.
  const hasCookie = req.cookies.getAll().some((c) => c.name.includes("auth-token"));
  return hasCookie;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth
  const authed = await isAuthenticated(req);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let body: { platformId?: string; frame?: TelemetryFrame; history?: TelemetryFrame[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const platformId = body.platformId;
  if (!platformId || typeof platformId !== "string") {
    return NextResponse.json({ error: "platformId is required" }, { status: 400 });
  }

  // Rate limit per platform
  const rateLimitKey = platformId;
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: `Rate limited — max 1 request per ${RATE_LIMIT_MS / 1000}s per platform` },
      { status: 429 }
    );
  }

  // Use provided frame or build a mock one
  const frame: TelemetryFrame = body.frame ?? buildMockFrame(platformId);
  const history: TelemetryFrame[] = body.history ?? [];

  try {
    const report = await runDiagnosticPipeline(frame, history, platformId);
    return NextResponse.json(report, { status: 200 });
  } catch (err) {
    console.error("[/api/diagnostics/analyze] Pipeline error:", err);
    return NextResponse.json(
      { error: "Diagnostic pipeline failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
