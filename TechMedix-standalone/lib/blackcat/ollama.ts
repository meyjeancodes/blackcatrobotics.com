/**
 * BlackCat OS — Ollama Client
 *
 * Unified local LLM client for fleet insights, diagnostic summaries,
 * and chat responses. Uses raw fetch to Ollama's /api/generate.
 *
 * SERVER-SIDE ONLY.
 */

const OLLAMA_URL = process.env.HERMES_OLLAMA_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.HERMES_OLLAMA_MODEL ?? "llama3.2:1b";
const OLLAMA_DISABLED = OLLAMA_MODEL === "disabled";

export interface OllamaOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  json?: boolean;
}

/**
 * Call Ollama with a prompt. Returns the raw text response.
 * Throws if Ollama is disabled or unreachable.
 */
export async function ollamaGenerate(
  prompt: string,
  options: OllamaOptions = {}
): Promise<string> {
  if (OLLAMA_DISABLED) throw new Error("Ollama disabled");

  const body: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.3,
      num_predict: options.maxTokens ?? 512,
    },
  };

  if (options.system) body.system = options.system;
  if (options.json) body.format = "json";

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(options.timeout ?? 30000),
  });

  if (!res.ok) throw new Error(`Ollama ${res.status}`);

  const data = await res.json();
  return data.response ?? "";
}

/**
 * Try Ollama first, fall back to a fallback function if unavailable.
 * This is the main integration pattern — use everywhere you want
 * local-first LLM with graceful degradation.
 */
export async function ollamaOrFallback<T>(
  prompt: string,
  fallback: () => T | Promise<T>,
  options: OllamaOptions = {}
): Promise<T | string> {
  try {
    return await ollamaGenerate(prompt, options);
  } catch (err) {
    console.warn("[ollama] Unavailable, using fallback:", (err as Error).message);
    return fallback();
  }
}

/**
 * Check if Ollama is reachable and a model is loaded.
 */
export async function ollamaHealthCheck(): Promise<{
  healthy: boolean;
  model: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { healthy: false, model: OLLAMA_MODEL, error: `HTTP ${res.status}` };
    const data = await res.json();
    const models = data.models?.map((m: { name: string }) => m.name) ?? [];
    const hasModel = models.includes(OLLAMA_MODEL);
    return {
      healthy: hasModel,
      model: OLLAMA_MODEL,
      error: hasModel ? undefined : `Model ${OLLAMA_MODEL} not found. Available: ${models.join(", ")}`,
    };
  } catch (err) {
    return { healthy: false, model: OLLAMA_MODEL, error: (err as Error).message };
  }
}
