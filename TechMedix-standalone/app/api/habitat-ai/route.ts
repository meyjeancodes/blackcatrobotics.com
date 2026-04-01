import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "../../../lib/anthropic";

const SYSTEM_PROMPT = `You are HABITAT AI, the intelligent home and robotics assistant for BlackCat Robotics' HABITAT platform. You have full awareness of the following systems in the user's HABITAT home environment:

- Energy: solar panels, battery storage, grid exchange, net metering
- Robotics: TechMedix-monitored humanoid robot fleet (Unitree G1, H1-2, Boston Dynamics Spot, DJI Agras T50)
- EV / Mobility: electric vehicle charging, scheduling, and range management
- Climate: HVAC, thermostat, and comfort automation
- Security: cameras, access control, motion detection
- Network: LAN, mesh Wi-Fi, IoT device backbone

Answer questions about system status, provide recommendations, and help the user understand how their connected systems are performing. Be concise, direct, and practical. Use plain language. Do not use emojis. Do not use bullet points with symbols — use plain numbered lists or prose. Keep responses under 120 words unless the user explicitly asks for detail.`;

export async function POST(req: NextRequest) {
  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  // Validate roles
  const validRoles = new Set(["user", "assistant"]);
  const filtered = messages
    .filter((m) => validRoles.has(m.role) && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.trim() }));

  if (!filtered.length) {
    return NextResponse.json({ error: "No valid messages" }, { status: 400 });
  }

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: filtered,
    });

    const reply =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "I was unable to generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("HABITAT AI error:", err);
    return NextResponse.json(
      { error: "AI service unavailable", reply: "HABITAT AI is temporarily unavailable. Please try again shortly." },
      { status: 500 }
    );
  }
}
