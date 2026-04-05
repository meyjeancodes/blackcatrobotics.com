/**
 * GET /api/techmedix/failure-modes/[id]/protocol
 * Returns the most recent repair protocol for a failure mode ID
 * Used by the RepairProtocolViewer in the technician dispatch view
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getRepairProtocol,
  getPredictiveSignals,
} from "@/lib/blackcat/knowledge/db";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch failure mode details
    const supabase = createServiceClient();
    const { data: fm, error: fmErr } = await supabase
      .from("failure_modes")
      .select("*, platform:platforms(slug, name, manufacturer)")
      .eq("id", id)
      .single();

    if (fmErr || !fm) {
      return NextResponse.json({ error: "Failure mode not found" }, { status: 404 });
    }

    const [protocol, signals] = await Promise.all([
      getRepairProtocol(id),
      getPredictiveSignals(id),
    ]);

    return NextResponse.json({
      failure_mode: fm,
      protocol,
      predictive_signals: signals,
    });
  } catch (err) {
    console.error(`[GET /api/techmedix/failure-modes/${id}/protocol]`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
