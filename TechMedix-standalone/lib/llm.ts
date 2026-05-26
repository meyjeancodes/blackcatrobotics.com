/**
 * Universal LLM Adapter
 *
 * One interface for Ollama, OpenAI-compatible APIs, and Anthropic.
 * Provider is selected via the LLM_PROVIDER env var:
 *   "ollama" (default)   → local Ollama at OLLAMA_BASE_URL (default localhost:11434)
 *   "openai"             → any OpenAI-compatible API at OPENAI_BASE_URL
 *   "anthropic"          → Anthropic API directly (raw fetch, no SDK)
 *
 * All consumers call llm.generate() or llm.generateJSON().
 * No file should import @anthropic-ai/sdk or any other SDK directly.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type LLMProvider = "ollama" | "openai" | "anthropic";

export type LLMMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
    >;

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: LLMMessageContent;
}

export interface GenerateOptions {
  /** System prompt (mapped to provider-appropriate location) */
  system?: string;
  /** Message history (for multi-turn). Mutually exclusive with prompt. */
  messages?: LLMMessage[];
  /** Single user prompt — convenience shorthand for one-turn calls */
  prompt?: string;
  /** Request structured JSON output */
  format?: "text" | "json";
  /** Sampling temperature (default 0 for deterministic) */
  temperature?: number;
  /** Max output tokens */
  maxTokens?: number;
  /** Override the provider's default model */
  model?: string;
}

export interface GenerateResult {
  text: string;
  usage?: { inputTokens: number; outputTokens: number };
  latencyMs: number;
}

// ─── Provider config ────────────────────────────────────────────────────────

function getProvider(): LLMProvider {
  return (process.env.LLM_PROVIDER as LLMProvider) || "ollama";
}

function ollamaConfig() {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3.2",
  };
}

function openaiConfig() {
  return {
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  };
}

function anthropicConfig() {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
  };
}

// ─── Core generate function ─────────────────────────────────────────────────

export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const t0 = Date.now();
  const provider = getProvider();

  try {
    switch (provider) {
      case "ollama":
        return generateOllama(options, t0);
      case "openai":
        return generateOpenAI(options, t0);
      case "anthropic":
        return generateAnthropic(options, t0);
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
  } catch (err) {
    const latencyMs = Date.now() - t0;
    throw err;
  }
}

// ─── JSON convenience wrapper ───────────────────────────────────────────────

/**
 * Call generate with format:'json' and parse the result.
 * Strips markdown fences, retries JSON parse once, then throws.
 */
export async function generateJSON<T = any>(options: GenerateOptions): Promise<T> {
  const result = await generate({ ...options, format: "json" });

  // Strip markdown code fences
  let clean = result.text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // Try to find a JSON block if stripping left stray text
  const jsonMatch = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }

  try {
    return JSON.parse(clean) as T;
  } catch {
    throw new Error(
      `Failed to parse JSON from LLM response.\nRaw: ${result.text.slice(0, 500)}`
    );
  }
}

// ─── Ollama provider ────────────────────────────────────────────────────────

async function generateOllama(options: GenerateOptions, t0: number): Promise<GenerateResult> {
  const cfg = ollamaConfig();
  const model = options.model || cfg.model;

  const messages = buildMessages(options);

  const body: Record<string, any> = {
    model,
    messages,
    stream: false,
    options: {
      temperature: options.temperature ?? 0,
      num_predict: options.maxTokens ?? 2048,
    },
  };

  const res = await fetch(`${cfg.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Ollama error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.message?.content ?? "";

  return {
    text,
    usage: data.prompt_eval_count != null
      ? { inputTokens: data.prompt_eval_count, outputTokens: data.eval_count ?? 0 }
      : undefined,
    latencyMs: Date.now() - t0,
  };
}

// ─── OpenAI-compatible provider ─────────────────────────────────────────────

async function generateOpenAI(options: GenerateOptions, t0: number): Promise<GenerateResult> {
  const cfg = openaiConfig();
  const model = options.model || cfg.model;

  const system = options.system;
  const messages: Record<string, any>[] = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  const userMessages = buildMessages(options);
  for (const m of userMessages) {
    // Convert unified message format to OpenAI format
    if (typeof m.content === "string") {
      messages.push({ role: m.role, content: m.content });
    } else {
      // Multi-modal content
      const oaiContent = m.content.map((part) => {
        if (part.type === "text") return { type: "text", text: part.text };
        if (part.type === "image") {
          return {
            type: "image_url",
            image_url: {
              url: `data:${part.source.media_type};base64,${part.source.data}`,
            },
          };
        }
        return { type: "text", text: "" };
      });
      messages.push({ role: m.role, content: oaiContent });
    }
  }

  const body: Record<string, any> = {
    model,
    messages,
    temperature: options.temperature ?? 0,
    max_tokens: options.maxTokens ?? 2048,
  };

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI-compatible error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";

  return {
    text,
    usage: data.usage
      ? { inputTokens: data.usage.prompt_tokens ?? 0, outputTokens: data.usage.completion_tokens ?? 0 }
      : undefined,
    latencyMs: Date.now() - t0,
  };
}

// ─── Anthropic provider (raw HTTP — no SDK) ────────────────────────────────

async function generateAnthropic(options: GenerateOptions, t0: number): Promise<GenerateResult> {
  const cfg = anthropicConfig();
  const model = options.model || cfg.model;

  if (!cfg.apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const system = options.system;
  const messages = buildMessages(options).map((m) => ({
    role: m.role === "system" ? "user" : m.role,
    content: m.content,
  }));

  const body: Record<string, any> = {
    model,
    max_tokens: options.maxTokens ?? 2048,
    temperature: options.temperature ?? 0,
    messages,
  };

  if (system) {
    body.system = system;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Anthropic error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text =
    data.content?.find((b: any) => b.type === "text")?.text ?? "";

  return {
    text,
    usage: data.usage
      ? { inputTokens: data.usage.input_tokens ?? 0, outputTokens: data.usage.output_tokens ?? 0 }
      : undefined,
    latencyMs: Date.now() - t0,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildMessages(options: GenerateOptions): LLMMessage[] {
  if (options.messages) return options.messages;
  if (options.prompt) return [{ role: "user", content: options.prompt }];
  return [];
}

/**
 * Detect if Ollama is running and reachable.
 * Useful for health checks and graceful fallback.
 */
export async function isOllamaReachable(): Promise<boolean> {
  try {
    const cfg = ollamaConfig();
    const res = await fetch(`${cfg.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}