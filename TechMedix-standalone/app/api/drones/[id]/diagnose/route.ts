import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check (internal-only)
  const auth = req.headers.get("x-blackcat-secret");
  if (auth !== process.env.BLACKCAT_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseServerConfigured() || !(await createSupabaseServerClient())) {
    return NextResponse.json(
      { error: "Diagnostics require Supabase connection" },
      { status: 503 }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 503 });
    }

    const { data: drone, error: droneErr } = await supabase
      .from("dji_drones")
      .select("serial_number, model")
      .eq("id", id)
      .single();

    if (droneErr || !drone) {
      return NextResponse.json({ error: "Drone not found" }, { status: 404 });
    }

    const body = await req.json();
    const telemetry = body.telemetry ?? {};

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are a diagnostics engine for DJI drones. Given telemetry JSON, output JSON: { severity: "info"|"warning"|"critical", issues: [{component, finding, recommendation}], overall_health_score: 0-100 }`,
      messages: [
        {
          role: "user",
          content: `Diagnose drone ${drone.serial_number || id}. Telemetry: ${JSON.stringify(telemetry)}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    let diagnosis: any = {};
    try { diagnosis = JSON.parse(text); } catch { /* keep raw */ }

    const { error: insertErr } = await supabase
      .from("drone_diagnostic_reports")
      .insert({
        drone_id: id,
        overall_health_score: diagnosis.overall_health_score ?? 80,
        report_json: diagnosis,
      });

    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, diagnosis });
  } catch (err) {
    console.error(`[POST /api/drones/${id}/diagnose] error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Diagnosis failed" },
      { status: 500 }
    );
  }
}
