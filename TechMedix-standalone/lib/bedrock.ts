/**
 * AWS Bedrock Integration for TechMedix
 *
 * Provides Claude model access via AWS Bedrock.
 * Falls back gracefully if Bedrock is unavailable.
 * Server-side only — never import in client components.
 */

import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseStreamCommand,
  type ConverseCommandInput,
  type ConverseStreamCommandInput,
  type Message,
} from "@aws-sdk/client-bedrock-runtime";

// ─── Configuration ───────────────────────────────────────────────────────────

const BEDROCK_REGION = process.env.AWS_BEDROCK_REGION ?? process.env.AWS_REGION ?? "us-east-1";

/** Task-type to model mapping — Sonnet for most tasks, Opus for complex diagnostics */
const MODEL_MAP: Record<string, string> = {
  diagnostic: "anthropic.claude-3-opus-20240229-v1:0",
  insight: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  dispatch: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  general: "anthropic.claude-3-5-sonnet-20241022-v2:0",
};

export function getBedrockModel(taskType: string = "general"): string {
  return MODEL_MAP[taskType] ?? MODEL_MAP.general;
}

// ─── Singleton client ────────────────────────────────────────────────────────

let _bedrockClient: BedrockRuntimeClient | null = null;

export function getBedrockClient(): BedrockRuntimeClient | null {
  if (_bedrockClient) return _bedrockClient;

  // Only init if AWS credentials are available (env vars or ~/.aws/credentials)
  if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE && !process.env.AWS_ROLE_ARN) {
    console.log("[bedrock] No AWS credentials found — Bedrock unavailable");
    return null;
  }

  try {
    _bedrockClient = new BedrockRuntimeClient({
      region: BEDROCK_REGION,
    });
    console.log(`[bedrock] Client initialized — region: ${BEDROCK_REGION}`);
    return _bedrockClient;
  } catch (err) {
    console.error("[bedrock] Failed to initialize client:", err);
    return null;
  }
}

/** Reset client (useful after credential rotation) */
export function resetBedrockClient(): void {
  _bedrockClient = null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BedrockInvokeOptions {
  model?: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  taskType?: string;
}

export interface BedrockResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

// ─── Invoke (non-streaming) ──────────────────────────────────────────────────

export async function invokeClaude(
  prompt: string,
  options: BedrockInvokeOptions = {}
): Promise<BedrockResult> {
  const client = getBedrockClient();
  if (!client) {
    throw new Error("BEDROCK_UNAVAILABLE");
  }

  const model = options.model ?? getBedrockModel(options.taskType);
  const maxTokens = options.maxTokens ?? 1024;
  const temperature = options.temperature ?? 0.4;

  const messages: Message[] = [
    {
      role: "user",
      content: [{ text: prompt }],
    },
  ];

  const input: ConverseCommandInput = {
    modelId: model,
    messages,
    inferenceConfig: {
      maxTokens,
      temperature,
    },
  };

  if (options.system) {
    input.system = [{ text: options.system }];
  }

  const t0 = Date.now();

  try {
    const command = new ConverseCommand(input);
    const response = await client.send(command);

    const text =
      response.output?.message?.content
        ?.filter((c) => c.text)
        .map((c) => c.text)
        .join("") ?? "";

    return {
      text,
      inputTokens: response.usage?.inputTokens ?? 0,
      outputTokens: response.usage?.outputTokens ?? 0,
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown Bedrock error";
    console.error(`[bedrock] invokeClaude failed (${model}):`, msg);
    throw new Error(`BEDROCK_ERROR: ${msg}`);
  }
}

// ─── Stream ──────────────────────────────────────────────────────────────────

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onComplete?: (result: { inputTokens: number; outputTokens: number; latencyMs: number }) => void;
  onError?: (error: Error) => void;
}

export async function streamClaude(
  prompt: string,
  options: BedrockInvokeOptions = {},
  callbacks?: StreamCallbacks
): Promise<BedrockResult> {
  const client = getBedrockClient();
  if (!client) {
    throw new Error("BEDROCK_UNAVAILABLE");
  }

  const model = options.model ?? getBedrockModel(options.taskType);
  const maxTokens = options.maxTokens ?? 1024;
  const temperature = options.temperature ?? 0.4;

  const messages: Message[] = [
    {
      role: "user",
      content: [{ text: prompt }],
    },
  ];

  const input: ConverseStreamCommandInput = {
    modelId: model,
    messages,
    inferenceConfig: {
      maxTokens,
      temperature,
    },
  };

  if (options.system) {
    input.system = [{ text: options.system }];
  }

  const t0 = Date.now();
  let fullText = "";
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const command = new ConverseStreamCommand(input);
    const response = await client.send(command);

    if (!response.stream) {
      throw new Error("No stream in Bedrock response");
    }

    for await (const event of response.stream) {
      // Content delta — partial text
      if (event.contentBlockDelta?.delta?.text) {
        const chunk = event.contentBlockDelta.delta.text;
        fullText += chunk;
        callbacks?.onChunk(chunk);
      }

      // Metadata — token counts at end
      if (event.metadata?.usage) {
        inputTokens = event.metadata.usage.inputTokens ?? 0;
        outputTokens = event.metadata.usage.outputTokens ?? 0;
      }
    }

    const latencyMs = Date.now() - t0;
    const result: BedrockResult = { text: fullText, inputTokens, outputTokens, latencyMs };
    callbacks?.onComplete?.({ inputTokens, outputTokens, latencyMs });
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown Bedrock stream error";
    console.error(`[bedrock] streamClaude failed (${model}):`, msg);
    const error = new Error(`BEDROCK_ERROR: ${msg}`);
    callbacks?.onError?.(error);
    throw error;
  }
}

// ─── Health check ────────────────────────────────────────────────────────────

export async function checkBedrockHealth(): Promise<{
  available: boolean;
  region: string;
  latencyMs?: number;
  error?: string;
}> {
  const client = getBedrockClient();
  if (!client) {
    return { available: false, region: BEDROCK_REGION, error: "No AWS credentials" };
  }

  try {
    const t0 = Date.now();
    // Minimal probe — 1 token to verify connectivity
    await invokeClaude("Reply with: ok", {
      maxTokens: 10,
      taskType: "general",
    });
    return { available: true, region: BEDROCK_REGION, latencyMs: Date.now() - t0 };
  } catch (err) {
    return {
      available: false,
      region: BEDROCK_REGION,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
