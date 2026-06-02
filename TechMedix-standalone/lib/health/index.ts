import type { CheckResult } from "./types";
import { checkMethods } from "./checkers/methods";
import { checkOllama } from "./checkers/ollama";
import { checkSkills } from "./checkers/skills";
import { checkProviders } from "./checkers/providers";

export async function runChecks(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  checks: CheckResult[];
  timestamp: string;
}> {
  const checks = await Promise.all([checkMethods(), checkOllama(), checkSkills(), checkProviders()]);

  const statuses = new Set(checks.map((check) => check.status));
  const status =
    statuses.has("unhealthy") ? "unhealthy" : statuses.has("degraded") ? "degraded" : "healthy";

  return { status, checks, timestamp: new Date().toISOString() };
}
