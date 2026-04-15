import Anthropic from "@anthropic-ai/sdk";
import { getBedrockClient as _getBedrockClient } from "./bedrock";
import { routeAI, type TaskType, type RouteResult } from "./ai-router";
import type { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

// ─── Anthropic client (singleton) ────────────────────────────────────────────

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _client;
}

// ─── Bedrock client re-export ────────────────────────────────────────────────

/**
 * Get the AWS Bedrock Runtime client.
 * Returns null if AWS credentials are not configured.
 */
export function getBedrockClient(): BedrockRuntimeClient | null {
  return _getBedrockClient();
}

// ─── Unified Claude interface ────────────────────────────────────────────────

export interface CallClaudeOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/**
 * Unified Claude call — routes through Bedrock (preferred) or Anthropic direct.
 * This is the primary entry point for all Claude usage in TechMedix.
 *
 * @param prompt    The user message
 * @param taskType  'diagnostic' | 'insight' | 'dispatch' | 'general'
 * @param options   Optional overrides
 * @returns         { text, provider, latencyMs, inputTokens, outputTokens }
 */
export async function callClaude(
  prompt: string,
  taskType: TaskType = "general",
  options: CallClaudeOptions = {}
): Promise<RouteResult> {
  return routeAI(prompt, taskType, options);
}
