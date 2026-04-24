/**
 * POST /api/chat
 *
 * AI diagnostic chat endpoint. Accepts messages and fleet context,
 * returns a grounded response from Ollama (local) or Claude (cloud).
 *
 * Request body:
 *   { messages: [{ role: "user" | "assistant", content: string }], robotId?: string }
 *
 * Response:
 *   { reply: string, source: "ollama" | "ai" | "fallback" }
 */

import { NextResponse } from "next/server";
import { createServiceClient, isSupabaseServiceConfigured } from "@/lib/supabase-service";
import { ollamaGenerate } from "@/lib/blackcat/ollama";
import type { BlackCatRobot, BlackCatAlert } from "@/types/blackcat";

const SYSTEM_PROMPT = `You are TechMedix, an AI diagnostic assistant for BlackCat Robotics.
You have access to live fleet telemetry and can answer questions about robot health,
maintenance alerts, failure modes, and dispatch operations.

Guidelines:
- Be specific and actionable. Reference actual robot names, health scores, and alert details when available.
- If asked about a specific robot, use the telemetry context provided.
- If you don't have enough data, say so clearly.
- Keep responses concise — 2-4 sentences for simple questions, longer only for complex analysis.
- Never make up data. Use only what's provided in the context.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildEmptyFleetContext(): string {
  return [
    "=== Current Fleet State ===",
    "No robots loaded — database is currently unavailable.",
    "",
    "=== Active Alerts ===",
    "No active alerts — system offline.",
    "",
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages ?? [];
    const robotId: string | undefined = body.robotId;

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const context = isSupabaseServiceConfigured() && createServiceClient()
      ? await buildFleetContext(robotId)
      : buildEmptyFleetContext();

    // Build the prompt with context
    const userMessage = messages[messages.length - 1];
    const conversationHistory = messages
      .slice(0, -1)
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Operator" : "TechMedix"}: ${m.content}`)
      .join("\n");

    const prompt = [
      context,
      conversationHistory ? `\nRecent conversation:\n${conversationHistory}` : "",
      `\nOperator: ${userMessage.content}`,
      "\nTechMedix:",
    ].join("\n");

    // Try Ollama first
    try {
      const reply = await ollamaGenerate(prompt, {
        system: SYSTEM_PROMPT,
        maxTokens: 512,
        temperature: 0.4,
        timeout: 20000,
      });
      if (reply.trim()) {
        return NextResponse.json({ reply: reply.trim(), source: "ollama" });
      }
    } catch {
      console.log("[chat] Ollama unavailable, trying Claude...");
    }

    // Fall back to Claude
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        });
        const text = response.content[0].type === "text" ? response.content[0].text : "";
        return NextResponse.json({ reply: text.trim(), source: "ai" });
      } catch {
        console.log("[chat] Claude unavailable");
      }
    }

    // Hard fallback
    return NextResponse.json({
      reply: "I'm temporarily unable to process your question. The fleet data is still being loaded — please try again in a moment.",
      source: "fallback",
    });
  } catch (err) {
    console.error("[chat] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function buildFleetContext(robotId?: string): Promise<string> {
  try {
    const supabase = createServiceClient();
    if (!supabase) throw new Error("Supabase client not available");

    let robotQuery = supabase.from("robots").select("*");
    if (robotId) {
      robotQuery = robotQuery.eq("id", robotId);
    }
    const { data: robots } = await robotQuery.limit(robotId ? 1 : 10);

    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(10);

    const robotSummary = (robots ?? [])
      .map((r: BlackCatRobot) =>
        `- ${r.name} (${r.platform}): ${r.health_score}% health, ${r.battery_level}% battery, status: ${r.status}`
      )
      .join("\n");

    const alertSummary = (alerts ?? [])
      .map((a: BlackCatAlert) =>
        `- [${a.severity}] ${a.title}${a.message ? `: ${a.message}` : ""}`
      )
      .join("\n");

    return [
      "=== Current Fleet State ===",
      robotSummary || "No robots loaded.",
      "",
      "=== Active Alerts ===",
      alertSummary || "No active alerts.",
      "",
    ].join("\n");
  } catch {
    return "[Fleet context unavailable]";
  }
}
