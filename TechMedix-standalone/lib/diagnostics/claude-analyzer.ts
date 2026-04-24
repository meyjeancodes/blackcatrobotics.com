/**
 * Layer 3 — Claude Deep Analysis
 *
 * SERVER-SIDE ONLY. Never import this in client components.
 * Only fires when Layer 2 exceedsThreshold: true.
 *
 * Produces human-readable repair recommendations operators and technicians act on.
 * Uses claude-sonnet-4-6 at temperature=0 for deterministic repair protocols.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AIAnalysisInput, AIAnalysisResult, ARGuidanceResponse } from "./types";

function isMockData() { return process.env.NEXT_PUBLIC_MOCK_DATA === "true"; }

// ─── Anthropic client (lazy init — only created server-side) ──────────────────

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are TechMedix, an AI diagnostic system for autonomous robots.
You receive telemetry data and anomaly analysis from two upstream systems:
  - Layer 1: A rule engine that flags threshold violations
  - Layer 2: A VLA behavioral comparator that scores deviation from expected robot action

Your job: produce a clear, actionable repair recommendation for a field technician.
Respond ONLY with valid JSON matching the schema provided. No markdown, no prose outside the JSON.
Be specific about components, procedures, and urgency.
Never guess — if data is insufficient, say so explicitly in the recommendation fields.
Calibrate confidence: 0.9+ means you are highly certain, 0.5 means moderate uncertainty.`;

function buildTelemetrySummary(frames: AIAnalysisInput["recentHistory"]): string {
  if (frames.length === 0) return "No recent history available.";
  const temps = frames.flatMap((f) => Object.values(f.joints).map((j) => j.temp));
  const torques = frames.flatMap((f) => Object.values(f.joints).map((j) => j.torque));
  const socs = frames.map((f) => f.battery.soc);
  const faults = [...new Set(frames.flatMap((f) => f.faultCodes))];

  const avg = (arr: number[]) => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : "n/a";
  const rangeStr = (arr: number[]) => arr.length ? `${Math.min(...arr).toFixed(1)}–${Math.max(...arr).toFixed(1)}` : "n/a";

  return [
    `Frames analyzed: ${frames.length}`,
    `Joint temp: avg ${avg(temps)}°C, range ${rangeStr(temps)}°C`,
    `Joint torque range: ${rangeStr(torques)} Nm`,
    `Battery SOC: ${rangeStr(socs)}%`,
    `Fault history: ${faults.length > 0 ? faults.join(", ") : "none"}`,
  ].join(" | ");
}

function buildUserPrompt(input: AIAnalysisInput): string {
  const { platform, frame, ruleResults, vlaComparison, recentHistory } = input;

  const rulesSummary = ruleResults.map(
    (r) => `  • [${r.severity.toUpperCase()}] ${r.ruleId}: ${r.summary} (confidence: ${(r.confidence * 100).toFixed(0)}%)`
  ).join("\n");

  const topDeltas = Object.entries(vlaComparison.jointDeltas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([k, v]) => `${k}: ${(v * 100).toFixed(1)}%`)
    .join(", ");

  return `Platform: ${platform.id} — ${platform.name} (${platform.manufacturer})

Layer 1 Rule Engine flagged:
${rulesSummary}

Layer 2 VLA Behavioral Analysis:
  - Behavioral anomaly score: ${vlaComparison.behavioralScore.toFixed(3)}/1.0
  - Most anomalous joints: ${vlaComparison.mostAnomalousJoints.join(", ")}
  - Top joint deltas: ${topDeltas}

Recent telemetry trend (last ${recentHistory.length} frames):
  ${buildTelemetrySummary(recentHistory)}

Current frame battery: ${frame.battery.soc}% SOC, ${frame.battery.temp}°C, ${frame.battery.cycleCount} cycles
Current fault codes: ${frame.faultCodes.length > 0 ? frame.faultCodes.join(", ") : "none"}

Respond with this exact JSON schema (no other text):
{
  "severity": "info|warning|critical|emergency",
  "title": "short title under 8 words",
  "summary": "2-3 sentence plain English summary for operator",
  "rootCause": "most likely root cause based on the data",
  "recommendation": {
    "immediate": "what to do right now",
    "shortTerm": "what to schedule within 48 hours",
    "preventive": "what to do to prevent recurrence"
  },
  "affectedComponents": ["list", "of", "components"],
  "estimatedDowntime": "e.g. 2-4 hours or 'none required'",
  "technicianRequired": true,
  "partsList": ["parts likely needed, or empty array if none"],
  "confidence": 0.0
}`;
}

// ─── Fallback result ──────────────────────────────────────────────────────────

function fallbackResult(reason: string, latencyMs: number): AIAnalysisResult {
  return {
    severity: "warning",
    title: "Diagnostic analysis unavailable",
    summary: `Layer 3 analysis could not be completed: ${reason}. Review Layer 1 and Layer 2 results directly.`,
    rootCause: "Unable to determine — see rule engine output.",
    recommendation: {
      immediate: "Review Layer 1 rule engine findings and escalated alerts.",
      shortTerm: "Schedule technician inspection based on triggered rules.",
      preventive: "Retry diagnostic pipeline once connectivity is restored.",
    },
    affectedComponents: [],
    estimatedDowntime: "Unknown",
    technicianRequired: true,
    partsList: [],
    confidence: 0,
    _meta: { tokensUsed: 0, latencyMs, isMock: false },
  };
}

// ─── Mock result ──────────────────────────────────────────────────────────────

function mockAnalysis(input: AIAnalysisInput): AIAnalysisResult {
  const hasCritical = input.ruleResults.some((r) => r.severity === "critical");
  const allAffected = [...new Set(input.ruleResults.flatMap((r) => r.affectedComponents))];

  return {
    severity: hasCritical ? "critical" : "warning",
    title: hasCritical ? "Critical actuator fault detected" : "Elevated anomaly score — inspection advised",
    summary: `TechMedix detected ${input.ruleResults.length} rule violation(s) on ${input.platform.name}. ` +
      `Behavioral anomaly score of ${input.vlaComparison.behavioralScore.toFixed(2)} exceeds threshold, ` +
      `with ${input.vlaComparison.mostAnomalousJoints.length} joints showing elevated deviation.`,
    rootCause: hasCritical
      ? "Likely actuator wear or thermal fault in arm joints from extended high-duty operation."
      : "Progressive gear wear or sensor drift — recommend proactive inspection before next work session.",
    recommendation: {
      immediate: hasCritical
        ? "Pause robot operations. Do not restart until thermal inspection is completed."
        : "Reduce duty cycle by 30% and monitor for escalation over next 2 hours.",
      shortTerm: "Schedule arm joint inspection and torque calibration within 48 hours. " +
        "Check F/T sensor zero-point calibration for wrist sensors.",
      preventive: "Implement 45-minute cool-down cycles between extended manipulation sessions. " +
        "Add joint wear tracking to weekly PM checklist.",
    },
    affectedComponents: allAffected.length > 0 ? allAffected : ["arm-joints"],
    estimatedDowntime: hasCritical ? "4-6 hours" : "1-2 hours",
    technicianRequired: hasCritical,
    partsList: hasCritical ? ["arm-joint-seal-kit", "thermal-compound", "torque-sensor-calibration-kit"] : [],
    confidence: 0.82,
    _meta: { tokensUsed: 0, latencyMs: 0, isMock: true },
  };
}

// ─── Vision analysis (AR guidance) ───────────────────────────────────────────

const AR_SAFE_FALLBACK: ARGuidanceResponse = {
  overlay_text: "Inspection in progress",
  component_highlight: null,
  next_step: "Continue with standard inspection protocol. Verify all fasteners and connections.",
  severity: "ok",
  confidence: 0,
};

export async function analyzeWithVision(params: {
  frame: string;
  platformId: string;
  activeFault?: string;
  fmeaContext?: object[];
}): Promise<ARGuidanceResponse> {
  const { frame, platformId, activeFault, fmeaContext } = params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return AR_SAFE_FALLBACK;
  }

  const client = getClient();
  const faultContext = activeFault ?? "routine inspection";
  const fmeaSummary =
    fmeaContext && fmeaContext.length > 0
      ? `\nFMEA context: ${JSON.stringify(fmeaContext.slice(0, 3))}`
      : "";

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system:
        "You are an AR diagnostic assistant for robot maintenance technicians. Analyze the camera frame and provide specific, actionable guidance. Respond ONLY with valid JSON matching the schema below. No markdown, no preamble.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: frame },
            },
            {
              type: "text",
              text: `Platform: ${platformId}. Active fault: ${faultContext}.${fmeaSummary}\nRespond with JSON: {"overlay_text": "brief text max 60 chars", "component_highlight": {"x": 0.5, "y": 0.5, "radius": 0.05, "label": "component"} or null, "next_step": "specific action max 120 chars", "severity": "ok" or "warning" or "critical", "confidence": 0.0}`,
            },
          ],
        },
      ],
    });

    const rawText = message.content[0]?.type === "text" ? message.content[0].text : "";

    try {
      const clean = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      return JSON.parse(clean) as ARGuidanceResponse;
    } catch {
      console.error("[analyzeWithVision] JSON parse failed:", rawText.slice(0, 200));
      return AR_SAFE_FALLBACK;
    }
  } catch (err) {
    console.error("[analyzeWithVision] API error:", err);
    return AR_SAFE_FALLBACK;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function analyzeWithClaude(
  input: AIAnalysisInput
): Promise<AIAnalysisResult> {
  // Always use mock in demo mode or when API key is absent
  if (isMockData() || !process.env.ANTHROPIC_API_KEY) {
    const result = mockAnalysis(input);
    console.log(
      `[Layer 3 — ai-analyzer] mock fired — severity: ${result.severity}, ` +
      `confidence: ${result.confidence}, tokens: 0`
    );
    return result;
  }

  const t0 = Date.now();

  try {
    const client = getClient();
    const userPrompt = buildUserPrompt(input);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const latencyMs = Date.now() - t0;
    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const tokensUsed =
      (message.usage.input_tokens ?? 0) + (message.usage.output_tokens ?? 0);

    let parsed: Omit<AIAnalysisResult, "_meta">;
    try {
      // Strip any accidental markdown fences before parsing
      const clean = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("[Layer 3 — ai-analyzer] JSON parse failed:", rawText.slice(0, 200));
      return fallbackResult("JSON parse failure", latencyMs);
    }

    const result: AIAnalysisResult = {
      ...parsed,
      _meta: { tokensUsed, latencyMs, isMock: false },
    };

    console.log(
      `[Layer 3 — ai-analyzer] severity: ${result.severity}, ` +
      `confidence: ${result.confidence}, tokens: ${tokensUsed}, latency: ${latencyMs}ms`
    );

    return result;
  } catch (err) {
    const latencyMs = Date.now() - t0;
    console.error("[Layer 3 — ai-analyzer] API error:", err);
    return fallbackResult(
      err instanceof Error ? err.message : "Unknown error",
      latencyMs
    );
  }
}
