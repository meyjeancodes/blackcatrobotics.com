#!/usr/bin/env tsx
/**
 * TechMedix Knowledge Moat — Research Data Seed Script
 *
 * Reads all JSON files from scripts/research-data/ and upserts them
 * into the Supabase knowledge moat tables via lib/blackcat/knowledge/db.ts.
 *
 * Usage:
 *   npx tsx scripts/seed-research-data.ts
 *   npx tsx scripts/seed-research-data.ts --file humanoids-quadrupeds.json
 *   npx tsx scripts/seed-research-data.ts --dry-run
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// Load .env.local manually (no dotenv dependency required)
const envPath = join(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found — env vars must be set externally
}

import {
  upsertPlatform,
  upsertFailureMode,
  insertRepairProtocol,
  insertPredictiveSignal,
  logResearch,
} from "../lib/blackcat/knowledge/db";
import { createServiceClient } from "../lib/supabase-service";

const RESEARCH_DATA_DIR = join(__dirname, "research-data");
const DRY_RUN = process.argv.includes("--dry-run");
const FILE_FILTER = (() => {
  const idx = process.argv.indexOf("--file");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

type StepInput = {
  step: number;
  action: string;
  tool?: string | null;
  warning?: string | null;
  image_hint?: string | null;
};

type PartInput = {
  part_name: string;
  part_number?: string;
  supplier?: string;
  unit_cost_usd?: number;
  qty: number;
};

type SignalInput = {
  signal_name: string;
  signal_source?: string;
  threshold_value?: number;
  threshold_operator?: string;
  threshold_unit?: string;
  lead_time_hours?: number;
  confidence?: number;
  notes?: string;
};

type ProtocolInput = {
  title: string;
  steps: StepInput[];
  tools_required?: string[];
  parts?: PartInput[];
  labor_minutes?: number;
  skill_level?: string;
  source_url?: string;
};

type FailureModeInput = {
  component: string;
  symptom: string;
  root_cause: string;
  severity: "critical" | "high" | "medium" | "low";
  mtbf_hours?: number;
  source_urls?: string[];
  confidence?: string;
  tags?: string[];
  repair_protocol?: ProtocolInput;
  predictive_signals?: SignalInput[];
};

type SupplierInput = {
  name: string;
  website?: string;
  region: string;
  component_types?: string[];
  lead_time_days?: number;
  risk_level?: string;
  notes?: string;
};

type PlatformInput = {
  slug: string;
  name: string;
  manufacturer: string;
  type: string;
  introduced_year?: number;
  specs_json?: Record<string, unknown>;
  failure_modes?: FailureModeInput[];
  suppliers?: SupplierInput[];
  research_sources?: string[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveConfidence(fm: FailureModeInput): "high" | "medium" | "low" | "unverified" {
  const count = fm.source_urls?.filter((u) => u !== "unverified-training-data").length ?? 0;
  if (count >= 3) return "high";
  if (count >= 1) return "medium";
  if (fm.confidence === "high" || fm.confidence === "medium") return fm.confidence;
  return "low";
}

function normalizeSkillLevel(s?: string): "basic" | "intermediate" | "advanced" | "specialist" {
  if (s === "basic" || s === "intermediate" || s === "advanced" || s === "specialist") return s;
  return "intermediate";
}

function normalizeType(t: string): string {
  const map: Record<string, string> = {
    "delivery-ground": "delivery_ground",
    "delivery-air": "delivery_air",
    "warehouse-amr": "warehouse_amr",
  };
  return map[t] ?? t;
}

// ── Seed one platform ─────────────────────────────────────────────────────────

async function seedPlatform(p: PlatformInput, runId: string): Promise<{
  slug: string;
  failureModes: number;
  protocols: number;
  signals: number;
}> {
  console.log(`  ↳ ${p.name} (${p.slug})`);

  if (DRY_RUN) {
    console.log(`    [DRY RUN] Would upsert platform + ${p.failure_modes?.length ?? 0} failure modes`);
    return { slug: p.slug, failureModes: 0, protocols: 0, signals: 0 };
  }

  const platformId = await upsertPlatform({
    slug: p.slug,
    name: p.name,
    manufacturer: p.manufacturer,
    type: normalizeType(p.type) as Parameters<typeof upsertPlatform>[0]["type"],
    introduced_year: p.introduced_year ?? null,
    specs_json: p.specs_json ?? {},
    techmedix_status: "supported",
    image_url: null,
    notes: null,
  });

  let fmCount = 0;
  let protoCount = 0;
  let sigCount = 0;

  for (const fm of p.failure_modes ?? []) {
    const fmId = await upsertFailureMode({
      platform_id: platformId,
      component: fm.component,
      symptom: fm.symptom,
      root_cause: fm.root_cause,
      severity: fm.severity,
      mtbf_hours: fm.mtbf_hours ?? null,
      source_urls: fm.source_urls ?? ["unverified-training-data"],
      confidence: deriveConfidence(fm),
      tags: fm.tags ?? [],
    });
    fmCount++;

    if (fm.repair_protocol) {
      const proto = fm.repair_protocol;
      await insertRepairProtocol({
        failure_mode_id: fmId,
        title: proto.title,
        steps_json: (proto.steps ?? []).map((s) => ({
          step: s.step,
          action: s.action,
          tool: s.tool ?? null,
          warning: s.warning ?? null,
          image_hint: s.image_hint ?? null,
        })),
        tools_required: proto.tools_required ?? [],
        parts_json: (proto.parts ?? []).map((part) => ({
          part_name: part.part_name,
          part_number: part.part_number ?? "unknown",
          supplier: part.supplier ?? "unknown",
          unit_cost_usd: part.unit_cost_usd ?? 0,
          qty: part.qty,
        })),
        labor_minutes: proto.labor_minutes ?? null,
        skill_level: normalizeSkillLevel(proto.skill_level),
        source_url: proto.source_url ?? null,
        verified_by: "research_agent",
        version: 1,
      });
      protoCount++;
    }

    for (const sig of fm.predictive_signals ?? []) {
      await insertPredictiveSignal({
        failure_mode_id: fmId,
        signal_name: sig.signal_name,
        signal_source: sig.signal_source ?? null,
        threshold_value: sig.threshold_value ?? null,
        threshold_operator: (sig.threshold_operator ?? ">") as Parameters<typeof insertPredictiveSignal>[0]["threshold_operator"],
        threshold_unit: sig.threshold_unit ?? null,
        lead_time_hours: sig.lead_time_hours ?? null,
        confidence: sig.confidence ?? null,
        notes: sig.notes ?? null,
      });
      sigCount++;
    }
  }

  // Upsert suppliers
  const supabase = createServiceClient();
  for (const s of p.suppliers ?? []) {
    await supabase.from("suppliers").upsert(
      {
        name: s.name,
        website: s.website ?? null,
        region: s.region,
        component_types: s.component_types ?? [],
        platforms_served: [p.slug],
        lead_time_days: s.lead_time_days ?? null,
        risk_level: s.risk_level ?? "medium",
        notes: s.notes ?? null,
      },
      { onConflict: "name,region" }
    );
  }

  // Log research sources
  for (const url of p.research_sources ?? []) {
    if (url !== "unverified-training-data") {
      await logResearch({
        platform_id: platformId,
        source_url: url,
        source_type: "other",
        content_summary: `Seed run ${runId} — ${p.name}`,
        agent_run_id: runId,
      });
    }
  }

  return { slug: p.slug, failureModes: fmCount, protocols: protoCount, signals: sigCount };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("TechMedix Knowledge Moat — Research Data Seed");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  console.log("");

  const runId = `seed-${new Date().toISOString().split("T")[0]}`;

  // Collect JSON files
  let files: string[];
  try {
    files = readdirSync(RESEARCH_DATA_DIR).filter((f) => f.endsWith(".json"));
    if (FILE_FILTER) files = files.filter((f) => f === FILE_FILTER);
  } catch {
    console.error(`ERROR: Research data directory not found: ${RESEARCH_DATA_DIR}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log("No JSON files found in scripts/research-data/");
    process.exit(0);
  }

  console.log(`Found ${files.length} file(s): ${files.join(", ")}`);
  console.log("");

  let totalPlatforms = 0;
  let totalFM = 0;
  let totalProto = 0;
  let totalSig = 0;

  for (const file of files) {
    console.log(`Processing: ${file}`);
    const raw = readFileSync(join(RESEARCH_DATA_DIR, file), "utf-8");
    let data: { platforms: PlatformInput[] };
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`  ERROR: Invalid JSON in ${file}: ${err}`);
      continue;
    }

    for (const platform of data.platforms ?? []) {
      try {
        const result = await seedPlatform(platform, runId);
        totalPlatforms++;
        totalFM += result.failureModes;
        totalProto += result.protocols;
        totalSig += result.signals;
        console.log(`    ✓ ${result.slug}: ${result.failureModes} FM, ${result.protocols} protocols, ${result.signals} signals`);
      } catch (err) {
        console.error(`    ✗ ${platform.slug}: ${err instanceof Error ? err.message : err}`);
      }
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════════");
  console.log("Seed complete:");
  console.log(`  Platforms: ${totalPlatforms}`);
  console.log(`  Failure modes: ${totalFM}`);
  console.log(`  Repair protocols: ${totalProto}`);
  console.log(`  Predictive signals: ${totalSig}`);
  console.log(`  Run ID: ${runId}`);
  if (DRY_RUN) console.log("  (DRY RUN — no data written)");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
