/**
 * Cost Tracker — session and monthly projection for diagnostic pipeline spend.
 *
 * Layer 2 (VLA HuggingFace inference): ~$0.001 per call
 * Layer 3 (Claude sonnet-4-6):
 *   Input:  ~$3.00 / 1M tokens
 *   Output: ~$15.00 / 1M tokens
 *   Typical call: ~800 input + ~400 output = ~$0.0084 per call
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { CostProjection } from "./types";

// ─── Per-call cost constants ──────────────────────────────────────────────────

const LAYER2_COST_PER_CALL = 0.001;                   // $0.001 per VLA inference
const LAYER3_INPUT_COST_PER_TOKEN = 3.0 / 1_000_000;  // $3.00 / MTok
const LAYER3_OUTPUT_COST_PER_TOKEN = 15.0 / 1_000_000; // $15.00 / MTok

export function calcLayer3Cost(tokens: number): number {
  // Approximate 67% input / 33% output split based on typical prompt shape
  const inputTokens = Math.round(tokens * 0.67);
  const outputTokens = tokens - inputTokens;
  return inputTokens * LAYER3_INPUT_COST_PER_TOKEN + outputTokens * LAYER3_OUTPUT_COST_PER_TOKEN;
}

// ─── Session store (module-level, survives re-renders within a tab session) ───

interface SessionCosts {
  layer2Calls: number;
  layer3Tokens: number;
}

const _session: SessionCosts = { layer2Calls: 0, layer3Tokens: 0 };

export function trackLayer2Call(): void {
  _session.layer2Calls += 1;
}

export function trackLayer3Call(tokens: number): void {
  _session.layer3Tokens += tokens;
}

export function getSessionCost(): { layer2: number; layer3: number; total: number } {
  const layer2 = _session.layer2Calls * LAYER2_COST_PER_CALL;
  const layer3 = calcLayer3Cost(_session.layer3Tokens);
  return { layer2, layer3, total: layer2 + layer3 };
}

export function resetSessionCost(): void {
  _session.layer2Calls = 0;
  _session.layer3Tokens = 0;
}

// ─── Monthly projection ───────────────────────────────────────────────────────

/**
 * @param robotCount     Number of monitored robots
 * @param checksPerHour  Diagnostic pipeline runs per robot per hour
 *                       (not every check reaches Layer 2/3 — use escalation rate)
 * @param layer2EscRate  Fraction of checks that reach Layer 2 (default 0.3 = 30%)
 * @param layer3EscRate  Fraction of Layer 2 checks that reach Layer 3 (default 0.4)
 */
export function getMonthlyProjection(
  robotCount: number,
  checksPerHour: number,
  layer2EscRate = 0.3,
  layer3EscRate = 0.4
): CostProjection {
  const hoursPerMonth = 24 * 30;
  const totalChecks = robotCount * checksPerHour * hoursPerMonth;

  const layer2Calls = totalChecks * layer2EscRate;
  const layer3Calls = layer2Calls * layer3EscRate;

  const avgLayer3Tokens = 1200; // typical prompt: ~800 input + ~400 output
  const hourlyLayer2 = robotCount * checksPerHour * layer2EscRate * LAYER2_COST_PER_CALL;
  const hourlyLayer3 = robotCount * checksPerHour * layer2EscRate * layer3EscRate * calcLayer3Cost(avgLayer3Tokens);

  return {
    hourlyLayer2,
    hourlyLayer3,
    monthlyLayer2: layer2Calls * LAYER2_COST_PER_CALL,
    monthlyLayer3: layer3Calls * calcLayer3Cost(avgLayer3Tokens),
    monthlyTotal: layer2Calls * LAYER2_COST_PER_CALL + layer3Calls * calcLayer3Cost(avgLayer3Tokens),
  };
}

// ─── React hook ───────────────────────────────────────────────────────────────

export function useDiagnosticCost() {
  const [costs, setCosts] = useState(() => getSessionCost());

  const refresh = useCallback(() => {
    setCosts(getSessionCost());
  }, []);

  // Poll every 5 seconds to catch updates from other components
  useEffect(() => {
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  const projection = getMonthlyProjection(10, 2); // default: 10 robots, 2 checks/hr

  return { costs, projection, refresh };
}
