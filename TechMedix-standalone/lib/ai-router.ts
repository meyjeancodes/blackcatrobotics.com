/**
 * AI Router — Smart provider selection for TechMedix
 *
 * Tries AWS Bedrock first (cheaper, counts toward AWS Activate credits),
 * falls back to direct Anthropic API if Bedrock is unavailable or fails.
 *
 * Returns { text, provider, latencyMs } so callers know which backend was used.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  invokeClaude as bedrockInvoke,
  getBedrockModel,
  type BedrockInvokeOptions,
} from "./bedrock";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskType = "diagnostic" | "insight" | "dispatch" | "general";

export interface RouteOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string; // override model ID
}

export interface RouteResult {
  text: string;
  provider: "bedrock" | "anthropic";
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

// ─── Anthropic direct fallback ───────────────────────────────────────────────

let _anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropicClient) {
    _anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _anthropicClient;
}

/** Map task types to direct Anthropic model names */
const ANTHROPIC_MODEL_MAP: Record<TaskType, string> = {
  diagnostic: "claude-opus-4-0-20250514",
  insight: "claude-sonnet-4-6",
  dispatch: "claude-sonnet-4-6",
  general: "claude-sonnet-4-6",
};

async function callAnthropicDirect(
  prompt: string,
  taskType: TaskType,
  options: RouteOptions
): Promise<RouteResult> {
  const client = getAnthropicClient();
  const model = options.model ?? ANTHROPIC_MODEL_MAP[taskType];
  const maxTokens = options.maxTokens ?? 1024;
  const temperature = options.temperature ?? 0.4;

  const t0 = Date.now();

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: options.system ?? "You are TechMedix, an AI assistant for autonomous robot fleet management.",
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0]?.type === "text" ? message.content[0].text : "";

  return {
    text,
    provider: "anthropic",
    latencyMs: Date.now() - t0,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}

// ─── Router ──────────────────────────────────────────────────────────────────

/**
 * Route an AI call — tries Bedrock first, falls back to direct Anthropic.
 *
 * @param prompt     The user prompt / question
 * @param taskType   One of: 'diagnostic' | 'insight' | 'dispatch' | 'general'
 * @param options    Optional overrides for system prompt, max_tokens, temperature
 */
export async function routeAI(
  prompt: string,
  taskType: TaskType = "general",
  options: RouteOptions = {}
): Promise<RouteResult> {
  // ── Try Bedrock first ──
  try {
    const bedrockOpts: BedrockInvokeOptions = {
      model: options.model,
      system: options.system,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      taskType,
    };

    const result = await bedrockInvoke(prompt, bedrockOpts);

    console.log(
      `[ai-router] provider=bedrock model=${getBedrockModel(taskType)} ` +
      `tokens=${result.inputTokens}+${result.outputTokens} latency=${result.latencyMs}ms`
    );

    return {
      text: result.text,
      provider: "bedrock",
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    };
  } catch (bedrockErr) {
    const reason =
      bedrockErr instanceof Error ? bedrockErr.message : "Unknown Bedrock error";

    // Only fall back for availability errors, not prompt issues
    if (
      reason.includes("BEDROCK_UNAVAILABLE") ||
      reason.includes("BEDROCK_ERROR")
    ) {
      console.warn(`[ai-router] Bedrock failed (${reason}) — falling back to Anthropic direct`);
    } else {
      console.warn(`[ai-router] Bedrock unexpected error — falling back: ${reason}`);
    }
  }

  // ── Fallback: Anthropic direct ──
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI_UNAVAILABLE: Both Bedrock and Anthropic API are unavailable");
  }

  const result = await callAnthropicDirect(prompt, taskType, options);

  console.log(
    `[ai-router] provider=anthropic model=${ANTHROPIC_MODEL_MAP[taskType]} ` +
    `tokens=${result.inputTokens}+${result.outputTokens} latency=${result.latencyMs}ms`
  );

  return result;
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

/** Route a diagnostic analysis call */
export async function routeDiagnostic(
  prompt: string,
  system?: string
): Promise<RouteResult> {
  return routeAI(prompt, "diagnostic", {
    system: system ?? "You are TechMedix, an AI diagnostic system for autonomous robots. Produce clear, actionable repair recommendations.",
    maxTokens: 1024,
    temperature: 0,
  });
}

/** Route a fleet/energy insight call */
export async function routeInsight(
  prompt: string,
  system?: string
): Promise<RouteResult> {
  return routeAI(prompt, "insight", {
    system: system ?? "You are TechMedix, an AI assistant for autonomous robot fleet management. Provide concise, data-driven insights.",
    maxTokens: 512,
    temperature: 0.4,
  });
}

/** Route a dispatch decision call */
export async function routeDispatch(
  prompt: string,
  system?: string
): Promise<RouteResult> {
  return routeAI(prompt, "dispatch", {
    system: system ?? "You are TechMedix, a dispatch coordination AI. Prioritize robot service requests by urgency and resource availability.",
    maxTokens: 512,
    temperature: 0.2,
  });
}
