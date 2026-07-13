/**
 * TechMedix Autonomous Web Research Agent
 * Searches the web for platform teardowns, service manuals, failure reports,
 * repair videos, patents, and forum threads — then extracts structured data
 * and persists it to Supabase.
 *
 * Uses: env-selected LLM via lib/llm adapter (Ollama default, OpenAI-compatible, or Anthropic).
 * Provider override per-call is allowed but defaults to LLM_PROVIDER env var.
 * Search backend: SearXNG (SEARXNG_URL, self-hosted, preferred) with Serper.dev
 * (SERPER_API_KEY) as a fallback. Falls back to empty (no live search) if neither.
 */

import { generate, generateJSON } from "@/lib/llm";
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
  extracted: number;
  low_confidence_count: number;
  confidence_avg: number;
  completed_at: string;
  status: "completed" | "partial" | "failed";
  persist_errors?: string[];
  debug_llm_raw?: string;
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
//
// Search backend is configurable and open-source friendly:
//   1. SearXNG (preferred, self-hosted, AGPL) when SEARXNG_URL is set.
//      Calls the JSON API: `${SEARXNG_URL}/search?q=...&format=json`
//   2. Serper.dev (Google) as a fallback if SERPER_API_KEY is set.
//   3. Empty result (graceful) if neither is configured.

async function webSearch(query: string): Promise<Array<{ title: string; snippet: string; link: string }>> {
  const searxngUrl = process.env.SEARXNG_URL;
  if (searxngUrl) {
    try {
      const res = await fetch(
        `${searxngUrl.replace(/\/$/, "")}/search?q=${encodeURIComponent(query)}&format=json`,
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) }
      );
      if (!res.ok) {
        console.warn(`[web-researcher] SearXNG search failed: ${res.status}`);
        return [];
      }
      const data = await res.json();
      return (data.results ?? []).map(
        (r: { title: string; content: string; url: string }) => ({
          title: r.title,
          snippet: r.content,
          link: r.url,
        })
      );
    } catch (err) {
      console.warn(`[web-researcher] SearXNG request error: ${String(err)}`);
      return [];
    }
  }

  // Fallback: Serper.dev (Google Search)
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn("[web-researcher] No SEARXNG_URL or SERPER_API_KEY set — skipping live search");
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
  const m = platform.manufacturer;
  return [
    `"${n}" common failure modes problems issue`,
    `"${n}" won't turn on falls over error code fault`,
    `"${n}" repair fix troubleshoot reddit`,
    `"${n}" site:reddit.com failure broke warranty RMA`,
    `"${n}" actuator motor overheating battery not charging`,
    `"${n}" teardown disassembly maintenance worn part`,
    `"${m}" "${n}" service bulletin recall defect`,
    `"${n}" forum community "my" broke stopped working`,
  ];
}

// ── Structured extraction via configurable LLM (lib/llm) ─────────────────────

async function extractStructuredData(
  platform: ResearchTarget,
  searchResults: Array<{ title: string; snippet: string; link: string }>
): Promise<{ failures: ExtractedFailureMode[]; raw: string }> {
  if (searchResults.length === 0) return { failures: [], raw: "" };

  // Prioritize results whose title/snippet mention failure-related terms,
  // but always fall back to sending a broad window so Groq sees real content.
  const FAILURE_KW = /fail|broken|broke|error|fault|issue|problem|overheat|warranty|rma|repair|not charging|won't|wont|stuck|dead|crash|defect|recall|spasm|falls?|down/i;
  const ranked = [...searchResults].sort((a, b) => {
    const ascore = FAILURE_KW.test(`${a.title} ${a.snippet}`) ? 1 : 0;
    const bscore = FAILURE_KW.test(`${b.title} ${b.snippet}`) ? 1 : 0;
    return bscore - ascore;
  });
  const context = ranked
    .slice(0, 25)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.link}`)
    .join("\n\n");

  const systemPrompt = `You are a robotics field-service intelligence analyst for TechMedix, a maintenance platform for autonomous robots and micromobility.

Your task: Extract REAL, SOURCED failure mode data from web search results about the ${platform.name} (${platform.type}, by ${platform.manufacturer}).

Rules:
- Only extract failure modes that are clearly evidenced in the search results
- Never fabricate repair steps or part numbers — use "unknown" if not stated in sources
- Cite source URLs for every failure mode (only URLs that appear in the results)
- Mark confidence as exactly one of: "high", "medium", "low", or "unverified" (do NOT combine them, e.g. never write "low/unverified")
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
    const result = await generate({
      maxTokens: 4096,
      temperature: 0,
      system: systemPrompt,
      prompt: userPrompt,
    });
    const raw = result.text;

    // Strip markdown fences and extract the first [...] or {...} block.
    let clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) clean = jsonMatch[0];

    let parsed: unknown;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("[web-researcher] extractStructuredData: JSON parse failed. Raw:", raw.slice(0, 500));
      return { failures: [], raw: raw.slice(0, 600) };
    }

    if (!Array.isArray(parsed)) {
      console.error("[web-researcher] extractStructuredData: parsed is not an array:", typeof parsed);
      return { failures: [], raw: raw.slice(0, 600) };
    }

    // Sanitize confidence to the DB enum (high|medium|low|unverified).
    // Models may emit "low/unverified", "medium-high", etc. — coerce safely.
    const CONFIDENCE_RANK: Record<string, number> = {
      high: 3, medium: 2, low: 1, unverified: 0,
    };
    const failures = parsed.map((fm) => {
      const raw_conf = String((fm as any).confidence ?? "").toLowerCase();
      let conf: ExtractedFailureMode["confidence"] = "unverified";
      if (raw_conf.includes("high")) conf = "high";
      else if (raw_conf.includes("medium")) conf = "medium";
      else if (raw_conf.includes("low")) conf = "low";
      else if (raw_conf.includes("unverif")) conf = "unverified";
      else if (Object.keys(CONFIDENCE_RANK).includes(raw_conf)) conf = raw_conf as ExtractedFailureMode["confidence"];
      return { ...(fm as ExtractedFailureMode), confidence: conf };
    });
    return { failures, raw: raw.slice(0, 600) };
  } catch (err) {
    console.error("[web-researcher] extractStructuredData failed:", err);
    return { failures: [], raw: String(err).slice(0, 600) };
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
): Promise<{ fmInserted: number; protocolsInserted: number; signalsInserted: number; persistErrors: string[] }> {
  let fmInserted = 0;
  let protocolsInserted = 0;
  let signalsInserted = 0;
  const persistErrors: string[] = [];

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
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[web-researcher] Failed to persist failure mode "${fm.component}/${fm.symptom}":`, msg);
      persistErrors.push(`${fm.component}/${fm.symptom}: ${msg}`);
    }
  }

  return { fmInserted, protocolsInserted, signalsInserted, persistErrors };
}

// ── Main research function ────────────────────────────────────────────────────

export async function researchPlatform(
  platform: ResearchTarget,
  agentRunId: string
): Promise<ResearchSummary> {
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

    // 2. Extract structured data via the configured LLM (lib/llm)
    const { failures, raw: llmRaw } = await extractStructuredData(platform, uniqueResults);
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
    const { fmInserted, protocolsInserted, signalsInserted, persistErrors } = await persistExtractedData(
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
      extracted: failures.length,
      low_confidence_count: lowConfCount,
      confidence_avg: Math.round(confidenceAvg * 100) / 100,
      completed_at: new Date().toISOString(),
      status: persistErrors.length > 0 ? "partial" : "completed",
      persist_errors: persistErrors,
      debug_llm_raw: llmRaw,
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
      extracted: 0,
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
