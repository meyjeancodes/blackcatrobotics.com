// Stub — AI router shim to satisfy imports without heavy deps
export type TaskType = string;
export interface RouteResult {
  provider: "anthropic" | "openai" | "bedrock";
  model: string;
  reason: string;
}
export function routeAI(_task: TaskType, _content?: string): RouteResult {
  return { provider: "anthropic", model: "claude-sonnet-4", reason: "default" };
}
