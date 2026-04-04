/**
 * TechMedix Autonomous Web Research Agent
 * Searches the web for platform teardowns, service manuals, failure reports,
 * repair videos, patents, and forum threads — then extracts structured data
 * and persists it to Supabase.
 *
 * Uses: Anthropic claude-sonnet-4-6 with tool-use pattern for structured extraction.
 * Search backend: SERPER_API_KEY (Google Search via serper.dev), falls back to demo mode.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  upsertPlatform,
  upsertFailureMode,
  insertRepairProtocol,
  insertPredictiveSignal,
  logResearch,
  getPlatformBySlug,
} from "@/lib/blackcat/knowledge/db";
import { createServiceClient } from "@/lib/supabase-service";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ResearchTarget = {
  slug: string;      // e.g. 'unitree_g1'
  name: string;      // e.g. 'Unitree G1'
  manufacturer: string;
  type: "humanoid" | "quadruped" | "drone" | "delivery_ground" | "delivery_air" | "warehouse_amr" | "micromobility" | "other";
  introduced_year?: number;
};

export type ExtractedFailureMode = {
  component: string;
  symptom: string;
  root_cause: string;
  severity: "critical" | "high" | "medium" | "low";
  mtbf_hours?: number;
  source_urls: string[];
  confidence: "high" | "medium" | "low" | "unverified";
  tags: string[];
  repair_steps?: Array<{
    step: number;
    action: string;
    tool?: string;
    warning?: string;
  }>;
  tools_required?: string[];
  parts?: Array<{
    part_name: string;
    part_number?: string;
    supplier?: string;
    unit_cost_usd?: number;
    qty: number;
  }>;
  labor_minutes?: number;
  skill_level?: "basic" | "intermediate" | "advanced" | "specialist";
  predictive_signals?: Array<{
    signal_name: string;
    signal_source?: string;
    threshold_value?: number;
    threshold_operator?: ">" | "<" | ">=" | "<=" | "==";
    threshold_unit?: string;
    lead_time_hours?: number;
    confidence?: number;
    notes?: string;
  }>;
};

export type ResearchSummary = {
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

// ── Platform Registry ─────────────────────────────────────────────────────────

export const RESEARCH_PLATFORMS: ResearchTarget[] = [
  { slug: "unitree_g1",         name: "Unitree G1",                  manufacturer: "Unitree Robotics",      type: "humanoid",        introduced_year: 2024 },
  { slug: "unitree_h1_2",       name: "Unitree H1-2",                manufacturer: "Unitree Robotics",      type: "humanoid",        introduced_year: 2024 },
  { slug: "boston_dynamics_spot", name: "Boston Dynamics Spot",      manufacturer: "Boston Dynamics",       type: "quadruped",       introduced_year: 2019 },
  { slug: "dji_agras_t50",      name: "DJI Agras T50",               manufacturer: "DJI",                   type: "drone",           introduced_year: 2023 },
  { slug: "dji_matrice_350",    name: "DJI Matrice 350 RTK",         manufacturer: "DJI",                   type: "drone",           introduced_year: 2023 },
  { slug: "amazon_proteus",     name: "Amazon Proteus AMR",          manufacturer: "Amazon Robotics",       type: "warehouse_amr",   introduced_year: 2022 },
  { slug: "zipline_p2",         name: "Zipline P2 Zip",              manufacturer: "Zipline",               type: "delivery_air",    introduced_year: 2023 },
  { slug: "serve_rs2",          name: "Serve Robotics RS2",          manufacturer: "Serve Robotics",        type: "delivery_ground", introduced_year: 2023 },
  { slug: "starship_gen3",      name: "Starship Gen 3",              manufacturer: "Starship Technologies", type: "delivery_ground", introduced_year: 2023 },
  { slug: "figure_02",          name: "Figure 02",                   manufacturer: "Figure AI",             type: "humanoid",        introduced_year: 2024 },
  { slug: "skydio_x10",         name: "Skydio X10",                  manufacturer: "Skydio",                type: "drone",           introduced_year: 2023 },
  { slug: "lime_gen4",          name: "Lime Gen 4 E-scooter",        manufacturer: "Lime",                  type: "micromobility",   introduced_year: 2023 },
  { slug: "bird_three",         name: "Bird Three E-scooter",        manufacturer: "Bird",                  type: "micromobility",   introduced_year: 2022 },
  { slug: "rad_commercial",     name: "Rad Power Commercial eBike",  manufacturer: "Rad Power Bikes",       type: "micromobility",   introduced_year: 2022 },
];

// ── Search utilities ─────────────────────────────────────────────────────────

async function webSearch(query: string): Promise<Array<{ title: string; snippet: string; link: string }>> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn("[web-researcher] SERPER_API_KEY not set — skipping live search");
    return [];
  }

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 8 }),
  });

  if (!res.ok) {
    console.warn(`[web-researcher] Serper search failed: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return (data.organic ?? []).map((r: { title: string; snippet: string; link: string }) => ({
    title: r.title,
    snippet: r.snippet,
    link: r.link,
  }));
}

function buildSearchQueries(platform: ResearchTarget): string[] {
  const n = platform.name;
  return [
    `"${n}" teardown repair disassembly maintenance`,
    `"${n}" failure modes common problems breakdown`,
    `"${n}" service manual technical documentation`,
    `"${n}" repair forum Reddit iFixit community fix`,
    `"${n}" predictive maintenance telemetry signals`,
    `"${n}" replacement parts actuator motor battery supplier`,
  ];
}

// ── Structured extraction via Claude ─────────────────────────────────────────

async function extractStructuredData(
  client: Anthropic,
  platform: ResearchTarget,
  searchResults: Array<{ title: string; snippet: string; link: string }>
): Promise<ExtractedFailureMode[]> {
  if (searchResults.length === 0) return [];

  const context = searchResults
    .slice(0, 12)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.link}`)
    .join("\n\n");

  const systemPrompt = `You are a robotics field-service intelligence analyst for TechMedix, a maintenance platform for autonomous robots and micromobility.

Your task: Extract REAL, SOURCED failure mode data from web search results about the ${platform.name} (${platform.type}, by ${platform.manufacturer}).

Rules:
- Only extract failure modes that are clearly evidenced in the search results
- Never fabricate repair steps or part numbers — use "unknown" if not stated in sources
- Cite source URLs for every failure mode (only URLs that appear in the results)
- Mark confidence as "low" or "unverified" if fewer than 2 results corroborate the finding
- severity: critical = safety risk or complete stoppage; high = major degradation; medium = reduced performance; low = cosmetic/minor
- skill_level: basic (any tech), intermediate (certified), advanced (specialized), specialist (factory-level)
- Keep repair steps factual and minimal — no speculation
- For predictive signals, only include ones explicitly mentioned in the sources`;

  const userPrompt = `Platform: ${platform.name}
Type: ${platform.type}
Manufacturer: ${platform.manufacturer}

Search results:
${context}

Extract all failure modes you can reliably identify from these results. Return a JSON array with this schema:
[
  {
    "component": "string — specific component name",
    "symptom": "string — observable failure symptom",
    "root_cause": "string — technical root cause",
    "severity": "critical|high|medium|low",
    "mtbf_hours": number | null,
    "source_urls": ["url1", "url2"],
    "confidence": "high|medium|low|unverified",
    "tags": ["tag1", "tag2"],
    "repair_steps": [
      { "step": 1, "action": "string", "tool": "string|null", "warning": "string|null" }
    ],
    "tools_required": ["tool1"],
    "parts": [
      { "part_name": "string", "part_number": "string|null", "supplier": "string|null", "unit_cost_usd": number|null, "qty": 1 }
    ],
    "labor_minutes": number | null,
    "skill_level": "basic|intermediate|advanced|specialist",
    "predictive_signals": [
      {
        "signal_name": "string",
        "signal_source": "string|null",
        "threshold_value": number|null,
        "threshold_operator": ">|<|>=|<=|==",
        "threshold_unit": "string|null",
        "lead_time_hours": number|null,
        "confidence": 0.0-1.0,
        "notes": "string|null"
      }
    ]
  }
]

If no reliable failure modes can be extracted, return an empty array [].
Respond with ONLY the JSON array, no other text.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed as ExtractedFailureMode[];
  } catch (err) {
    console.error("[web-researcher] extractStructuredData failed:", err);
    return [];
  }
}

// ── Supabase persistence ──────────────────────────────────────────────────────

async function persistPlatform(platform: ResearchTarget): Promise<string> {
  // Use existing platform if it's already in DB
  const existing = await getPlatformBySlug(platform.slug);
  if (existing) return existing.id;

  return upsertPlatform({
    slug: platform.slug,
    name: platform.name,
    manufacturer: platform.manufacturer,
    type: platform.type,
    introduced_year: platform.introduced_year ?? null,
    specs_json: {},
    techmedix_status: "supported",
    image_url: null,
    notes: null,
  });
}

async function persistExtractedData(
  platformId: string,
  failures: ExtractedFailureMode[],
  agentRunId: string
): Promise<{ fmInserted: number; protocolsInserted: number; signalsInserted: number }> {
  let fmInserted = 0;
  let protocolsInserted = 0;
  let signalsInserted = 0;

  for (const fm of failures) {
    try {
      const fmId = await upsertFailureMode({
        platform_id: platformId,
        component: fm.component,
        symptom: fm.symptom,
        root_cause: fm.root_cause,
        severity: fm.severity,
        mtbf_hours: fm.mtbf_hours ?? null,
        source_urls: fm.source_urls,
        confidence: fm.source_urls.length >= 3 ? fm.confidence : "low",
        tags: fm.tags,
      });
      fmInserted++;

      // Insert repair protocol if steps available
      if (fm.repair_steps && fm.repair_steps.length > 0) {
        await insertRepairProtocol({
          failure_mode_id: fmId,
          title: `${fm.component} — ${fm.symptom}`,
          steps_json: fm.repair_steps.map((s) => ({
            step: s.step,
            action: s.action,
            tool: s.tool ?? null,
            warning: s.warning ?? null,
            image_hint: null,
          })),
          tools_required: fm.tools_required ?? [],
          parts_json: (fm.parts ?? []).map((p) => ({
            part_name: p.part_name,
            part_number: p.part_number ?? "unknown",
            supplier: p.supplier ?? "unknown",
            unit_cost_usd: p.unit_cost_usd ?? 0,
            qty: p.qty,
          })),
          labor_minutes: fm.labor_minutes ?? null,
          skill_level: fm.skill_level ?? "intermediate",
          source_url: fm.source_urls[0] ?? null,
          verified_by: "research_agent",
          version: 1,
        });
        protocolsInserted++;
      }

      // Insert predictive signals
      for (const sig of fm.predictive_signals ?? []) {
        await insertPredictiveSignal({
          failure_mode_id: fmId,
          signal_name: sig.signal_name,
          signal_source: sig.signal_source ?? null,
          threshold_value: sig.threshold_value ?? null,
          threshold_operator: sig.threshold_operator ?? null,
          threshold_unit: sig.threshold_unit ?? null,
          lead_time_hours: sig.lead_time_hours ?? null,
          confidence: sig.confidence ?? null,
          notes: sig.notes ?? null,
        });
        signalsInserted++;
      }
    } catch (err) {
      console.error(`[web-researcher] Failed to persist failure mode "${fm.component}/${fm.symptom}":`, err);
    }
  }

  return { fmInserted, protocolsInserted, signalsInserted };
}

// ── Main research function ────────────────────────────────────────────────────

export async function researchPlatform(
  platform: ResearchTarget,
  agentRunId: string
): Promise<ResearchSummary> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const startedAt = new Date().toISOString();

  console.log(`[web-researcher] Starting research for: ${platform.name}`);

  try {
    // 1. Run all search queries in parallel
    const queries = buildSearchQueries(platform);
    const results = await Promise.all(queries.map(webSearch));
    const allResults = results.flat();

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueResults = allResults.filter((r) => {
      if (seen.has(r.link)) return false;
      seen.add(r.link);
      return true;
    });

    console.log(`[web-researcher] ${platform.name}: ${uniqueResults.length} unique sources found`);

    // 2. Extract structured data via Claude
    const failures = await extractStructuredData(client, platform, uniqueResults);
    console.log(`[web-researcher] ${platform.name}: ${failures.length} failure modes extracted`);

    // 3. Upsert platform
    const platformId = await persistPlatform(platform);

    // 4. Log research sources
    for (const r of uniqueResults.slice(0, 20)) {
      await logResearch({
        platform_id: platformId,
        source_url: r.link,
        source_type: "other",
        content_summary: r.snippet,
        agent_run_id: agentRunId,
      });
    }

    // 5. Persist extracted data
    const { fmInserted, protocolsInserted, signalsInserted } = await persistExtractedData(
      platformId,
      failures,
      agentRunId
    );

    // 6. Compute confidence stats
    const lowConfCount = failures.filter(
      (f) => f.confidence === "low" || f.confidence === "unverified" || f.source_urls.length < 3
    ).length;
    const confidenceMap = { high: 1.0, medium: 0.65, low: 0.35, unverified: 0.1 };
    const confidenceAvg =
      failures.length > 0
        ? failures.reduce((acc, f) => acc + (confidenceMap[f.confidence] ?? 0.35), 0) / failures.length
        : 0;

    return {
      platform_slug: platform.slug,
      platform_name: platform.name,
      run_id: agentRunId,
      failure_modes_found: fmInserted,
      repair_protocols_found: protocolsInserted,
      signals_found: signalsInserted,
      sources_cited: uniqueResults.length,
      low_confidence_count: lowConfCount,
      confidence_avg: Math.round(confidenceAvg * 100) / 100,
      completed_at: new Date().toISOString(),
      status: "completed",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[web-researcher] Research failed for ${platform.name}:`, message);
    return {
      platform_slug: platform.slug,
      platform_name: platform.name,
      run_id: agentRunId,
      failure_modes_found: 0,
      repair_protocols_found: 0,
      signals_found: 0,
      sources_cited: 0,
      low_confidence_count: 0,
      confidence_avg: 0,
      completed_at: new Date().toISOString(),
      status: "failed",
      error: message,
    };
  }
}

// ── Agent run tracking ────────────────────────────────────────────────────────

export async function createAgentRun(): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agent_runs")
    .insert({ status: "running" })
    .select("id")
    .single();
  if (error) throw new Error(`createAgentRun: ${error.message}`);
  return data.id;
}

export async function completeAgentRun(
  runId: string,
  summaries: ResearchSummary[]
): Promise<void> {
  const supabase = createServiceClient();
  const totalInserted = summaries.reduce(
    (acc, s) => acc + s.failure_modes_found + s.repair_protocols_found + s.signals_found,
    0
  );
  const hasFailures = summaries.some((s) => s.status === "failed");
  const allFailed = summaries.every((s) => s.status === "failed");

  await supabase
    .from("agent_runs")
    .update({
      completed_at: new Date().toISOString(),
      platforms_processed: summaries.map((s) => ({
        slug: s.platform_slug,
        status: s.status,
        failure_modes: s.failure_modes_found,
        protocols: s.repair_protocols_found,
        signals: s.signals_found,
      })),
      records_inserted: totalInserted,
      status: allFailed ? "failed" : hasFailures ? "partial" : "completed",
    })
    .eq("id", runId);
}
