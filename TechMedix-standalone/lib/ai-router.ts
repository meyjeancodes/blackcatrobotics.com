/**
 * AI Router — delegates to lib/llm.ts
 *
 * Routes task types to the configured LLM provider.
 * Provider is selected via LLM_PROVIDER env var.
 */

import { generate, generateJSON } from "./llm";
export { generate, generateJSON };

export type TaskType = string;

export interface RouteResult {
  provider: string;
  model: string;
  reason: string;
}

export function routeAI(_task: TaskType, _content?: string): RouteResult {
  const provider = process.env.LLM_PROVIDER || "ollama";
  let model = "";

  switch (provider) {
    case "ollama":
      model = process.env.OLLAMA_MODEL || "llama3.2";
      break;
    case "openai":
      model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      break;
    case "anthropic":
      model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
      break;
    default:
      model = "unknown";
  }

  return { provider, model, reason: "router-default" };
}
