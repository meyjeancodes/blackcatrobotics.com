/** @jsxImportSource react */
/**
 * POST /api/ar-guidance
 *
 * Accepts a robot + fault description and returns AR overlay instructions.
 * Uses Kimi (Moonshot) vision-capable API via LM_API_KEY as primary,
 * with a text-only fallback if the API is unreachable.
 *
 * Body: { robot_id, platform_id, active_fault, image_data? }
 * Returns: { overlayResponse, confidence, log_id }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/techmedix/memory";

interface ArGuidanceBody {
  robot_id: string;
  platform_id: string;
  active_fault: string;
  image_data?: string;
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

    const faultDescription = body.active_fault;
    const apiKey = process.env.LM_API_KEY;

    // Step 1: Try Kimi/Moonshot vision-capable API
    let instructions: string;
    let confidence = 0.7;

    if (apiKey) {
      try {
        const prompt =
          body.image_data
            ? `Image attached. Fault: ${faultDescription}. Provide AR overlay instructions for a field technician working on this robot — step-by-step guidance with highlighted parts, tools needed, and safety warnings.`
            : `Fault: ${faultDescription}. Provide AR overlay instructions for a field technician working on this robot — step-by-step guidance with highlighted parts, tools needed, and safety warnings.`;

        const res = await fetch("https://api.moonshot.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "kimi-k1.5",
            messages: [
              {
                role: "system",
                content: "You are TechMedix AR Guidance, an expert AR overlay system for field robot technicians. Give concise, actionable step-by-step instructions. Use clear headings and bullet points.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 512,
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          instructions =
            data.choices?.[0]?.message?.content?.trim() ?? "AR guidance unavailable.";
          confidence = 0.85;
        } else {
          throw new Error(`Kimi API error (${res.status})`);
        }
      } catch (apiErr) {
        console.error("[AR-guidance] Kimi API failed, using fallback:", apiErr);
        // Fall through to text-only fallback
      }
    }

    // Step 2: Fallback — generate instructions from fault description alone
    if (!instructions) {
      instructions = generateFallbackInstructions(faultDescription, body.platform_id);
      confidence = 0.5;
    }

    // Step 3: Structure the overlay response
    const overlayResponse: Record<string, unknown> = {
      instructions,
      fault_detected: faultDescription,
      image_provided: !!body.image_data,
      timestamp: new Date().toISOString(),
    };

    // Step 4: Write to ar_guidance_log
    const supabase = await getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured", overlayResponse, confidence },
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
        confidence,
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

/**
 * Fallback instruction generator — produces AR overlay guidance
 * from the fault description alone when no vision API is available.
 */
function generateFallbackInstructions(fault: string, platformId?: string): string {
  const lines = fault.split(/[.;\n]/).filter((l) => l.trim().length > 0);
  const primaryFault = lines[0]?.trim() ?? fault;

  return `AR OVERLAY INSTRUCTIONS
Fault: ${primaryFault}
Platform: ${platformId ?? "Unknown"}

STEP 1 — STOP & SECURE
• Power down the affected subsystem immediately
• Engage mechanical safety lockout
• Verify no moving parts are in the fault zone

STEP 2 — ISOLATE THE FAULT
• Identify the component matching: ${primaryFault}
• Check visible damage, leaks, burnt marks, or loose connections
• Confirm the fault signature matches the reported symptom

STEP 3 — DIAGNOSE
• Measure electrical continuity / pressure / position as applicable
• Compare readings against spec for this platform
• Rule out secondary effects (other components causing the fault)

STEP 4 — REPAIR/RETURN TO SERVICE
• Replace or recalibrate the faulty component
• Verify fix with a functional check before re-powering
• Log the repair in the TechMedix dispatch system

⚠ SAFETY: Do not bypass safety interlocks. Qualified technician only.`
  .replace(/^\s+/gm, "")
  .trim();
}

export async function GET() {
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
