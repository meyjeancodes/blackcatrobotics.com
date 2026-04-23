import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "../../../../lib/anthropic";

const SYSTEM_PROMPT = `You are HABITAT AI Design Assistant. Given the CURRENT design parameters and a user request, output a JSON delta describing what should change.

Current params schema:
{
  "bedrooms": integer (1-6),
  "bathrooms": integer (1-5),
  "sqft": integer (300-8000),
  "stories": integer (1-3),
  "style": "modern" | "traditional" | "minimalist" | "industrial" | "craftsman",
  "features": ["solar" | "off-grid" | "smart-home" | "ev-charging" | "rainwater" | "compost"],
  "budget_max": integer,
  "budget_tier": "standard" | "pro" | "signature",
  "site_type": "urban" | "suburban" | "rural" | "off-grid",
  "notes": string
}

Rules:
- Output ONLY a JSON object. No conversational text.
- Only include keys that should change.
- Use null to remove a feature from the array.
- Be precise: "make kitchen bigger" -> { "sqft": <current + 200> }
- "add a garage" -> { "notes": "Add garage", "sqft": <current + 400> }
- "make it off-grid" -> { "site_type": "off-grid", "features": ["off-grid", "solar", "rainwater", "compost"] }

Output schema:
{
  "changes": { /* only changed keys */ },
  "reasoning": string,
  "requires_regen": boolean
}`;

export async function POST(req: NextRequest) {
  let body: {
    current_params?: Record<string, unknown>;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { current_params = {}, message = "" } = body;
  if (!message.trim()) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  const userContent = `CURRENT PARAMS:\n${JSON.stringify(current_params, null, 2)}\n\nUSER REQUEST: ${message.trim()}`;

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const raw =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "{}";

    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

    let parsed: { changes?: Record<string, unknown>; reasoning?: string; requires_regen?: boolean };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      changes: parsed.changes ?? {},
      reasoning: parsed.reasoning ?? "",
      requires_regen: parsed.requires_regen ?? true,
    });
  } catch (err) {
    console.error("HABITAT iterate error:", err);
    return NextResponse.json(
      { error: "AI service unavailable", changes: {}, reasoning: "", requires_regen: false },
      { status: 500 }
    );
  }
}
