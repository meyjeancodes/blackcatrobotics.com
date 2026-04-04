#!/usr/bin/env ts-node
/**
 * TechMedix Research Agent — CLI runner
 *
 * Loops through all platforms and triggers the web research agent for each.
 * Logs results to the agent_runs table in Supabase.
 *
 * Usage:
 *   npx ts-node scripts/run-research-agent.ts
 *   npx ts-node scripts/run-research-agent.ts --platform unitree_g1
 *   npx ts-node scripts/run-research-agent.ts --dry-run
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 *   SERPER_API_KEY  (optional — web search; skipped if not set)
 */

import * as fs from "fs";
import * as path from "path";

// Load env from .env.local if present
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

// Use require after env is loaded
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  researchPlatform,
  createAgentRun,
  completeAgentRun,
  RESEARCH_PLATFORMS,
} = require("../lib/blackcat/research/web-researcher");

type ResearchSummary = {
  platform_slug: string;
  platform_name: string;
  run_id: string;
  failure_modes_found: number;
  repair_protocols_found: number;
  signals_found: number;
  sources_cited: number;
  low_confidence_count: number;
  confidence_avg: number;
  completed_at: string;
  status: "completed" | "partial" | "failed";
  error?: string;
};

function formatTable(summaries: ResearchSummary[]): string {
  const headers = ["Platform", "FM", "Protocols", "Signals", "Sources", "LoConf", "ConfAvg", "Status"];
  const rows = summaries.map((s) => [
    s.platform_name.padEnd(36),
    String(s.failure_modes_found).padStart(4),
    String(s.repair_protocols_found).padStart(9),
    String(s.signals_found).padStart(7),
    String(s.sources_cited).padStart(7),
    String(s.low_confidence_count).padStart(6),
    s.confidence_avg.toFixed(2).padStart(7),
    s.status.padStart(9),
  ]);

  const headerRow = headers.map((h, i) => h.padEnd(rows[0]?.[i]?.length ?? h.length)).join(" | ");
  const divider = "─".repeat(headerRow.length);
  const dataRows = rows.map((r) => r.join(" | "));
  return [divider, headerRow, divider, ...dataRows, divider].join("\n");
}

function buildProgressMarkdown(summaries: ResearchSummary[]): string {
  const now = new Date().toISOString();
  const lines = [
    "# Research Progress",
    "",
    `_Last updated: ${now}_`,
    "",
    "| Platform | Failure Modes | Protocols | Signals | Avg Confidence | Low-Conf | Status | Last Updated |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
  ];

  for (const s of summaries) {
    lines.push(
      `| ${s.platform_name} | ${s.failure_modes_found} | ${s.repair_protocols_found} | ${s.signals_found} | ${s.confidence_avg.toFixed(2)} | ${s.low_confidence_count} | ${s.status} | ${s.completed_at.slice(0, 10)} |`
    );
  }

  lines.push("", "## Notes", "- `FM` = failure modes inserted this run (upsert — may not reflect cumulative total)", "- Low-Conf = entries with < 3 independent sources", "- Confidence is 0–1 averaged across all failure modes found in this run");
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const platformFlag = args.find((a) => a.startsWith("--platform="))?.split("=")[1]
    ?? (args.indexOf("--platform") !== -1 ? args[args.indexOf("--platform") + 1] : null);

  let platforms = RESEARCH_PLATFORMS;
  if (platformFlag) {
    const match = RESEARCH_PLATFORMS.find(
      (p: { slug: string }) => p.slug === platformFlag
    );
    if (!match) {
      console.error(`Unknown platform: ${platformFlag}`);
      console.error(`Known: ${RESEARCH_PLATFORMS.map((p: { slug: string }) => p.slug).join(", ")}`);
      process.exit(1);
    }
    platforms = [match];
  }

  console.log(`\nTechMedix Research Agent`);
  console.log(`Platforms: ${platforms.length}`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`SERPER_API_KEY: ${process.env.SERPER_API_KEY ? "set" : "NOT SET (search disabled)"}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "set" : "NOT SET"}\n`);

  if (dryRun) {
    console.log("Platforms that would be researched:");
    platforms.forEach((p: { slug: string; name: string }) => console.log(`  - ${p.name} (${p.slug})`));
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is required");
    process.exit(1);
  }

  const runId: string = await createAgentRun();
  console.log(`Agent run ID: ${runId}\n`);

  const summaries: ResearchSummary[] = [];

  for (const platform of platforms) {
    process.stdout.write(`Researching ${platform.name}... `);
    const summary: ResearchSummary = await researchPlatform(platform, runId);
    summaries.push(summary);

    if (summary.status === "failed") {
      console.log(`FAILED — ${summary.error}`);
    } else {
      console.log(`done (${summary.failure_modes_found} FM, ${summary.repair_protocols_found} protocols, ${summary.signals_found} signals)`);
    }

    // Write progress file after each platform
    const progressPath = path.join(__dirname, "..", "RESEARCH_PROGRESS.md");
    fs.writeFileSync(progressPath, buildProgressMarkdown(summaries), "utf-8");
  }

  await completeAgentRun(runId, summaries);

  console.log("\n" + formatTable(summaries));
  console.log("\nRESEARCH_PROGRESS.md updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
