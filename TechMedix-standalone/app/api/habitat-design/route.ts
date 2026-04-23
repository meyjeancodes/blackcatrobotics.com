import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "../../../lib/anthropic";

const SYSTEM_PROMPT = `You are HABITAT AI Design Assistant. Extract structured home design parameters from user input.

Output your response in two parts:
1. A conversational acknowledgment of what you understood (plain text, no JSON here)
2. A fenced JSON block at the very end with this exact schema:

\`\`\`json
{
  "bedrooms": integer (1-6),
  "bathrooms": integer (1-5),
  "sqft": integer (300-8000),
  "stories": integer (1-3),
  "style": "modern" | "traditional" | "minimalist" | "industrial" | "craftsman",
  "features": ["solar" | "off-grid" | "smart-home" | "ev-charging" | "rainwater" | "compost"],
  "budget_max": integer (dollars),
  "budget_tier": "standard" | "pro" | "signature",
  "site_type": "urban" | "suburban" | "rural" | "off-grid",
  "notes": string (freeform context)
}
\`\`\`

Rules:
- Infer missing values from context (e.g., "off-grid" implies site_type "off-grid" and features ["off-grid", "solar"])
- If budget is vague ("around 400k"), set budget_max to 400000
- Never guess style. If unclear, set to "modern"
- Only include keys you have information about. Omit unknowns entirely rather than guessing nulls.
- Keep the conversational part under 80 words.`;

interface DesignParams {
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  stories?: number;
  style?: string;
  features?: string[];
  budget_max?: number;
  budget_tier?: string;
  site_type?: string;
  notes?: string;
}

function extractJsonBlock(text: string): { reply: string; params?: DesignParams } {
  const fence = "\`\`\`json";
  const idx = text.lastIndexOf(fence);
  if (idx === -1) {
    return { reply: text.trim() };
  }

  const reply = text.slice(0, idx).trim();
  const jsonStart = idx + fence.length;
  let jsonEnd = text.indexOf("\`\`\`", jsonStart);
  if (jsonEnd === -1) jsonEnd = text.length;

  const jsonText = text.slice(jsonStart, jsonEnd).trim();
  try {
    const params = JSON.parse(jsonText) as DesignParams;
    // Strip undefined/null fields
    const cleaned: DesignParams = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        (cleaned as Record<string, unknown>)[k] = v;
      }
    }
    return { reply, params: cleaned };
  } catch {
    return { reply: text.trim() };
  }
}

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
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: filtered,
    });

    const raw =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "I was unable to generate a response. Please try again.";

    const { reply, params } = extractJsonBlock(raw);
    return NextResponse.json({ reply, params });
  } catch (err) {
    console.error("HABITAT Design API error:", err);
    return NextResponse.json(
      {
        error: "AI service unavailable",
        reply: "HABITAT AI Designer is temporarily unavailable. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
