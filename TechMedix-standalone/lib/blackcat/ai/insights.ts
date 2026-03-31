/**
 * BlackCat AI Insights
 *
 * Generates fleet and energy insights using Claude.
 * Results are cached in Supabase for 5 minutes to control API costs.
 *
 * SERVER-SIDE ONLY.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "../../supabase-service";
import type { BlackCatRobot, BlackCatAlert, EnergyTransaction } from "../../../types/blackcat";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let _anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

const SYSTEM_PROMPT =
  "You are BlackCat OS, an AI operations system for robotic fleets. " +
  "Analyze the provided fleet data and return a single, specific, actionable insight " +
  "in 2 sentences maximum. No preamble. No lists. Focus on the most critical issue. Be precise.";

export async function generateFleetInsight(input: {
  robots: BlackCatRobot[];
  alerts: BlackCatAlert[];
  avgHealth: number;
}): Promise<string> {
  const cached = await getCache("fleet");
  if (cached) return cached;

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackFleetInsight(input);
  }

  const prompt = [
    `Fleet summary: ${input.robots.length} robots, avg health ${input.avgHealth}%.`,
    `Status breakdown: ${statusSummary(input.robots)}.`,
    `Active alerts: ${input.alerts.length} (${criticalCount(input.alerts)} critical).`,
    `Lowest health: ${lowestHealth(input.robots)}.`,
  ].join(" ");

  const insight = await callClaude(prompt);
  await setCache("fleet", insight);
  return insight;
}

export async function generateEnergyInsight(input: {
  transactions: EnergyTransaction[];
  supplyTotal: number;
  demandTotal: number;
}): Promise<string> {
  const cached = await getCache("energy");
  if (cached) return cached;

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackEnergyInsight(input);
  }

  const prompt = [
    `Grid state: ${input.supplyTotal.toFixed(1)} kWh supply, ${input.demandTotal.toFixed(1)} kWh demand.`,
    `Transactions in last hour: ${input.transactions.length}.`,
    `Total traded: ${totalTraded(input.transactions).toFixed(2)} kWh.`,
  ].join(" ");

  const insight = await callClaude(prompt);
  await setCache("energy", insight);
  return insight;
}

async function callClaude(userPrompt: string): Promise<string> {
  try {
    const message = await getClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    if (message.content[0].type === "text") {
      return message.content[0].text.trim();
    }
    return "Unable to generate insight at this time.";
  } catch (err) {
    console.error("[ai/insights] Claude API error:", err);
    return "Unable to generate insight at this time.";
  }
}

async function getCache(type: string): Promise<string | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("ai_insights_cache")
      .select("insight, updated_at")
      .eq("type", type)
      .maybeSingle();

    if (!data?.insight || !data?.updated_at) return null;

    const age = Date.now() - new Date(data.updated_at).getTime();
    if (age > CACHE_TTL_MS) return null;

    return data.insight;
  } catch {
    return null;
  }
}

async function setCache(type: string, insight: string): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase
      .from("ai_insights_cache")
      .upsert({ type, insight, updated_at: new Date().toISOString() });
  } catch {
    // non-fatal
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusSummary(robots: BlackCatRobot[]): string {
  const counts = robots.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([s, n]) => `${n} ${s}`)
    .join(", ");
}

function criticalCount(alerts: BlackCatAlert[]): number {
  return alerts.filter((a) => a.severity === "critical" && !a.resolved).length;
}

function lowestHealth(robots: BlackCatRobot[]): string {
  if (robots.length === 0) return "N/A";
  const worst = robots.reduce((a, b) => (a.health_score < b.health_score ? a : b));
  return `${worst.name} at ${worst.health_score}%`;
}

function totalTraded(transactions: EnergyTransaction[]): number {
  return transactions.reduce((sum, t) => sum + (Number(t.kwh) || 0), 0);
}

function fallbackFleetInsight(input: {
  robots: BlackCatRobot[];
  avgHealth: number;
}): string {
  const warning = input.robots.filter((r) => r.status === "warning" || r.status === "service");
  if (warning.length > 0) {
    return `${warning[0].name} requires immediate attention with status ${warning[0].status}. Schedule a technician inspection to prevent further degradation.`;
  }
  return `Fleet operating at ${input.avgHealth}% average health with all ${input.robots.length} robots reporting. Continue routine monitoring.`;
}

function fallbackEnergyInsight(input: {
  supplyTotal: number;
  demandTotal: number;
}): string {
  const balance = input.supplyTotal - input.demandTotal;
  if (balance > 0) {
    return `Grid has ${balance.toFixed(1)} kWh net supply surplus. Consider redistributing to low-battery units to optimize fleet readiness.`;
  }
  return `Grid demand exceeds supply by ${Math.abs(balance).toFixed(1)} kWh. Prioritize recharging to restore operational balance.`;
}
