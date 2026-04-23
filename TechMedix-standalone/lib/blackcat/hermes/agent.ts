/**
 * Hermes Agent — BCR Internal Dispatch Coordinator
 *
 * Hermes is an employee of BlackCat Robotics.
 * It reasons about incoming jobs using a local Ollama/hermes3 model,
 * determines severity and minimum cert level required, then queues
 * the job and notifies all eligible BCR-certified technicians.
 *
 * No third-party dispatch APIs. All routing is internal.
 */

import { queueAndNotify } from "../dispatch/bcr-dispatch-client";

const OLLAMA_URL = process.env.HERMES_OLLAMA_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.HERMES_OLLAMA_MODEL ?? "hermes3";
const OLLAMA_DISABLED = OLLAMA_MODEL === "disabled";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface HermesJobInput {
  jobId: string;
  workOrderId: string;
  robotId: string;
  robotName: string;
  platformId: string;
  faultCode: string;
  faultDescription?: string;
  fmeaContext?: unknown[];
}

export interface HermesReasoning {
  severity: number;          // 1–5
  minCertLevel: number;      // 1–5
  summary: string;           // plain-language triage summary
  escalate: boolean;         // true if severity 4–5 (supervisor alert)
}

export interface HermesDispatchResult {
  agentSessionId: string;
  reasoning: HermesReasoning;
  dispatch: {
    queued: boolean;
    notified: string[];
    jobQueueId?: string;
    reason: string;
  };
}

// ── Session ID ─────────────────────────────────────────────────────────────────

export function generateSessionId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HS-${ts}-${rand}`;
}

// ── Ollama reasoning ───────────────────────────────────────────────────────────

/**
 * Ask hermes3 (local Ollama) to triage the job and return structured reasoning.
 * Falls back to rule-based defaults if Ollama is unavailable.
 */
export async function reasonWithHermes(
  input: HermesJobInput
): Promise<HermesReasoning> {
  const prompt = [
    "You are Hermes, a dispatch coordinator for BlackCat Robotics.",
    "BlackCat Robotics is a robot and drone diagnostics and repair company.",
    "Analyze the following job and return ONLY valid JSON — no explanation, no markdown.",
    "",
    `Fault Code: ${input.faultCode}`,
    `Platform: ${input.platformId}`,
    `Robot: ${input.robotName}`,
    input.faultDescription ? `Description: ${input.faultDescription}` : "",
    input.fmeaContext?.length
      ? `FMEA Records: ${JSON.stringify(input.fmeaContext)}`
      : "FMEA Records: none",
    "",
    "Return JSON with exactly these fields:",
    '{ "severity": <1-5>, "minCertLevel": <1-5>, "summary": "<one sentence triage>", "escalate": <true if severity >= 4> }',
  ]
    .filter(Boolean)
    .join("\n");

  if (OLLAMA_DISABLED) throw new Error("Ollama disabled — using rule-based fallback");
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`Ollama ${res.status}`);

    const data = await res.json();
    const parsed = JSON.parse(data.response);

    return {
      severity: Math.min(5, Math.max(1, Number(parsed.severity) || 2)),
      minCertLevel: Math.min(5, Math.max(1, Number(parsed.minCertLevel) || 2)),
      summary: String(parsed.summary ?? "Triage complete."),
      escalate: Boolean(parsed.escalate),
    };
  } catch (err) {
    console.warn("[hermes/agent] Ollama unavailable — using rule-based fallback:", err);
    // Rule-based fallback
    const sev = input.fmeaContext?.length ? 2 : 3;
    return {
      severity: sev,
      minCertLevel: sev >= 3 ? 3 : 2,
      summary: `Rule-based triage for fault ${input.faultCode} on ${input.platformId}.`,
      escalate: sev >= 4,
    };
  }
}

// ── Main dispatch entry point ──────────────────────────────────────────────────

export async function hermesDispatch(
  supabase: any,
  input: HermesJobInput
): Promise<HermesDispatchResult> {
  const agentSessionId = generateSessionId();

  // 1. Reason about the job
  const reasoning = await reasonWithHermes(input);

  // 2. Queue and notify eligible BCR techs
  const dispatch = await queueAndNotify(supabase, {
    jobId: input.jobId,
    platformId: input.platformId,
    faultCode: input.faultCode,
    robotName: input.robotName,
    severity: reasoning.severity,
    minCertLevel: reasoning.minCertLevel,
    agentSessionId,
  });

  return {
    agentSessionId,
    reasoning,
    dispatch,
  };
}
