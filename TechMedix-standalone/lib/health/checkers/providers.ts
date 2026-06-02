import type { CheckResult } from "../types";

export async function checkProviders(): Promise<CheckResult> {
  const started = Date.now();
  try {
    const provider = process.env.LLM_PROVIDER?.toLowerCase() ?? "ollama";

    return {
      name: "llm_provider",
      status: "healthy",
      message: `configured provider=${provider}`,
      latencyMs: Date.now() - started
    };
  } catch (error) {
    return {
      name: "llm_provider",
      status: "degraded",
      message: (error as Error).message,
      latencyMs: Date.now() - started
    };
  }
}
