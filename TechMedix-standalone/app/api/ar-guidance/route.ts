import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "../../../lib/anthropic";
import { createSupabaseServerClient as createClient, isSupabaseConfigured } from "../../../lib/supabase-server";

export const runtime = "nodejs";

interface ARGuidanceRequestLegacy {
  step_instruction: string;
  component_name: string;
  warnings?: string[];
}

interface ARGuidanceRequestVision {
  frame: string;
  robotId: string;
  activeFault?: string;
}

type ARGuidanceRequest = ARGuidanceRequestLegacy | ARGuidanceRequestVision;

function isVisionRequest(body: ARGuidanceRequest): body is ARGuidanceRequestVision {
  return "frame" in body && "robotId" in body;
}

const SAFE_FALLBACK = {
  overlay_text: "Inspection in progress",
  component_highlight: null as null | { x: number; y: number; radius: number; label: string },
  next_step: "Continue with standard inspection protocol. Verify all fasteners and connections.",
  severity: "ok" as "ok" | "warning" | "critical",
  confidence: 0,
};

export async function POST(req: NextRequest) {
  let body: ARGuidanceRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const client = getAnthropicClient();

  // ── Vision path (camera frame analysis) ───────────────────────────────────
  if (isVisionRequest(body)) {
    const { frame, robotId, activeFault } = body;

    if (!frame || !robotId) {
      return NextResponse.json(
        { error: "frame and robotId are required" },
        { status: 400 }
      );
    }

    // Determine platform name from robotId (best-effort lookup)
    let platformName = "robotic system";
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
      const supabase = await createClient();
      const { data: robot } = await supabase
        .from("robots")
        .select("name, platform")
        .eq("id", robotId)
        .single();
      if (robot) {
        platformName = [(robot as { name?: string; platform?: string }).name, (robot as { name?: string; platform?: string }).platform].filter(Boolean).join(" — ");
      }
    } catch {
      // Non-fatal — continue with generic platform name
    }

    const faultContext = activeFault ?? "routine inspection";

    try {
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system:
          "You are an AR diagnostic assistant for robot maintenance technicians. Analyze the camera frame and provide specific, actionable guidance. Respond ONLY with valid JSON matching the schema below. No markdown, no preamble.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: frame,
                },
              },
              {
                type: "text",
                text: `Robot: ${platformName}. Active fault: ${faultContext}. Respond with JSON: {"overlay_text": "brief text max 60 chars", "component_highlight": {"x": 0.5, "y": 0.5, "radius": 0.05, "label": "component"} or null, "next_step": "specific action max 120 chars", "severity": "ok" or "warning" or "critical", "confidence": 0.0}`,
              },
            ],
          },
        ],
      });

      const rawText =
        message.content[0]?.type === "text" ? message.content[0].text : "";

      let parsed: typeof SAFE_FALLBACK;
      try {
        const clean = rawText
          .replace(/^```json\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        parsed = JSON.parse(clean);
      } catch {
        console.error("[ar-guidance] JSON parse failed:", rawText.slice(0, 200));
        parsed = SAFE_FALLBACK;
      }

      // Log to Supabase (non-blocking, best-effort)
      try {
        const supabase = await createClient();
        await supabase.from("ar_guidance_log").insert({
          robot_id: robotId,
          active_fault: activeFault ?? null,
          overlay_response: parsed,
          confidence: parsed.confidence ?? 0,
        });
      } catch {
        // Non-fatal
      }

      return NextResponse.json(parsed);
    } catch (err) {
      console.error("[ar-guidance] Vision API error:", err);
      return NextResponse.json(SAFE_FALLBACK);
    }
  }

  // ── Legacy path (step instruction text guidance) ───────────────────────────
  const legacyBody = body as ARGuidanceRequestLegacy;
  const { step_instruction, component_name, warnings = [] } = legacyBody;

  if (!step_instruction || !component_name) {
    return NextResponse.json(
      { error: "step_instruction and component_name are required" },
      { status: 400 }
    );
  }

  const warningText =
    warnings.length > 0
      ? `\n\nActive warnings for this step:\n${warnings.map((w) => `• ${w}`).join("\n")}`
      : "";

  const userMessage = `Component: ${component_name}

Step instruction:
${step_instruction}${warningText}

Please provide clear, concise AR guidance for this step.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system:
        "You are an expert robotics technician assistant for humanoid robots. Be precise, safety-first, and concise. When warnings are present, always acknowledge them first. Format your response in 2-3 sentences maximum — this is displayed as AR overlay text.",
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    return NextResponse.json({ guidance: text });
  } catch (err) {
    console.error("[ar-guidance] Legacy API error:", err);
    return NextResponse.json(
      { error: "AI guidance unavailable" },
      { status: 502 }
    );
  }
}
