/**
 * DEPRECATED — Replaced by lib/llm.ts
 *
 * This file delegates to the universal LLM adapter (lib/llm.ts) for
 * backward compatibility. All new code should import from lib/llm.ts directly.
 *
 * The @anthropic-ai/sdk is no longer used — Anthropic is called via raw HTTP.
 */

import { generate, generateJSON } from "./llm";
export { generate, generateJSON };

// Runtime check: fail early if provider doesn't match (for legacy callers)
export function getAnthropicClient(): never {
  throw new Error(
    "getAnthropicClient() is deprecated. Use llm.generate() from lib/llm.ts instead."
  );
}

export function getBedrockClient(): null {
  return null;
}

/** @deprecated Use llm.generateJSON() from lib/llm.ts */
export async function callClaude(
  _prompt: string,
  _taskType?: string,
  _options?: Record<string, any>
): Promise<{ provider: string; model: string; reason: string }> {
  return { provider: getProviderName(), model: getModelName(), reason: "deprecated-shim" };
}

function getProviderName(): string {
  return process.env.LLM_PROVIDER || "ollama";
}

function getModelName(): string {
  return process.env.OLLAMA_MODEL || process.env.ANTHROPIC_MODEL || "llama3.2";
}
