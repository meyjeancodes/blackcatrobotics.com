/**
 * POST /api/ar-guidance
 *
 * Accepts a robot + fault description and returns AR overlay instructions
 * by running vision analysis through the local Ollama model.
 *
 * Body: { robot_id, platform_id, active_fault, image_data? }
 * Returns: { overlay_response, confidence, log_id }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/techmedix/memory";
import { runOllamaVision } from "@/lib/blackcat/ollama";

interface ArGuidanceBody {
  robot_id: string;
  platform_id: string;
  active_fault: string;
  image_data?: string;
}

interface ArGuidanceLogRow {
  id: string;
  robot_id: string;
  platform_id: string;
  active_fault: string;
  overlay_response: Record<string, unknown>;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ArGuidanceBody = await request.json();

    if (!body.robot_id || !body.platform_id || !body.active_fault) {
      return NextResponse.json(
        { error: "Missing required fields: robot_id, platform_id, active_fault" },
        { status: 400 }
      );
    }

    // 1. Build the prompt from the fault description
    const faultDescription = body.active_fault;
    const prompt = body.image_data
      ? `Image attached. Fault: ${faultDescription}. Provide AR overlay instructions for a field technician.`
      : `Fault: ${faultDescription}. Provide AR overlay instructions for a field technician working on the robot.`;

    // 2. Run Ollama vision analysis
    let ollamaText: string;
    let confidence: number = 0.5;
    try {
      const visionResult = await runOllamaVision(prompt, {
        temperature: 0.2,
        maxTokens: 512,
      });
      ollamaText = visionResult.response;
      confidence = visionResult.confidence;
    } catch (ollamaErr) {
      console.error("[AR-guidance] Ollama vision failed:", ollamaErr);
      return NextResponse.json(
        { error: "Ollama analysis unavailable", overlayResponse: null, confidence: 0 },
        { status: 503 }
      );
    }

    // 3. Structure the overlay response
    const overlayResponse: Record<string, unknown> = {
      instructions: ollamaText,
      fault_detected: faultDescription,
      image_provided: !!body.image_data,
      timestamp: new Date().toISOString(),
    };

    // 4. Write to ar_guidance_log
    const supabase = await getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured", overlayResponse: overlayResponse, confidence },
        { status: 503 }
      );
    }

    const { data: logRow, error: dbErr } = await supabase
      .from("ar_guidance_log")
      .insert({
        robot_id: body.robot_id,
        platform_id: body.platform_id,
        active_fault: faultDescription,
        overlay_response: overlayResponse,
        confidence: confidence,
      })
      .select()
      .single();

    if (dbErr) {
      console.error("[AR-guidance] Supabase insert failed:", dbErr);
      return NextResponse.json({
        overlayResponse,
        confidence,
        log_id: null,
        warning: "DB write failed but analysis completed",
      });
    }

    return NextResponse.json({
      overlayResponse,
      confidence,
      log_id: logRow?.id ?? null,
    });
  } catch (err) {
    console.error("[AR-guidance] Route error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return recent AR guidance logs for the dashboard
  const supabase = await getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: logs, error } = await supabase
    .from("ar_guidance_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }

  return NextResponse.json({ logs: logs ?? [] });
}
