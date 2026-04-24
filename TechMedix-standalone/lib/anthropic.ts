import Anthropic from "@anthropic-ai/sdk";

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

// ─── Stubbed Bedrock client ──────────────────────────────────────────────────

export function getBedrockClient(): any | null {
  return null;
}

// ─── Unified Claude interface ────────────────────────────────────────────────

export interface CallClaudeOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface RouteResult {
  provider: string;
  model: string;
  reason: string;
}

export async function callClaude(
  _prompt: string,
  _taskType: string = "general",
  _options: CallClaudeOptions = {}
): Promise<RouteResult> {
  return { provider: "anthropic", model: "claude-sonnet-4", reason: "default" };
}
