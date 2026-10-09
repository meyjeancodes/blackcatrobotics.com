/**
 * GET /api/alerts?customerId=&status=active|resolved|all&robotId=&limit=
 * List alerts for a customer, newest first. Part of the Muse connector surface.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase-service";
import { alerts as MOCK_ALERTS } from "../../../lib/shared/mock-data";
import {
  authenticateRequest,
  unauthorized,
  resolveCustomerId,
} from "@/lib/techmedix/api-auth";
import { checkRateLimit, rateLimitedResponse } from "@/lib/techmedix/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = ["active", "resolved", "all"] as const;

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.ok) return unauthorized();

  const rl = checkRateLimit(`alerts:GET:${auth.customerId ?? auth.via}`);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSec);

  const params = req.nextUrl.searchParams;
  const customerId = resolveCustomerId(auth, params.get("customerId"));
  if (!customerId) {
    return NextResponse.json(
      { error: "customerId query param is required" },
      { status: 400 }
    );
  }

  const status = params.get("status") ?? "active";
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: active, resolved, all" },
      { status: 400 }
    );
  }

  const robotId = params.get("robotId");
  const limit = Math.min(
    Math.max(parseInt(params.get("limit") ?? "50", 10) || 50, 1),
    200
  );

  // Mock fallback when Supabase is not configured (local dev / demo).
  if (!isSupabaseServiceConfigured()) {
    const filtered = MOCK_ALERTS.filter((a) => {
      if (a.customerId !== customerId) return false;
      if (robotId && a.robotId !== robotId) return false;
      if (status === "active") return a.status === "active";
      if (status === "resolved") return a.status !== "active";
      return true;
    }).slice(0, limit);
    return NextResponse.json({
      alerts: filtered,
      count: filtered.length,
      mock: true,
    });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ alerts: [], count: 0, mock: true });
  }

  let query = supabase
    .from("alerts")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status === "active") query = query.eq("resolved", false);
  if (status === "resolved") query = query.eq("resolved", true);
  if (robotId) query = query.eq("robot_id", robotId);

  const { data, error } = await query;
  if (error) {
    console.error("[GET /api/alerts]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: data ?? [], count: data?.length ?? 0 });
}
