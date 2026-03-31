import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "../../../lib/anthropic";

export const runtime = "nodejs";

interface ARGuidanceRequest {
  step_instruction: string;
  component_name: string;
  warnings?: string[];
}

export async function POST(req: NextRequest) {
  let body: ARGuidanceRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { step_instruction, component_name, warnings = [] } = body;

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
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system:
        "You are an expert robotics technician assistant for humanoid robots. Be precise, safety-first, and concise. When warnings are present, always acknowledge them first. Format your response in 2-3 sentences maximum — this is displayed as AR overlay text.",
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    return NextResponse.json({ guidance: text });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json(
      { error: "AI guidance unavailable" },
      { status: 502 }
    );
  }
}
