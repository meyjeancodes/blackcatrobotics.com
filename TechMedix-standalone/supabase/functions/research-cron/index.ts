/**
 * Supabase Edge Function: research-cron
 *
 * Weekly scheduled research refresh.
 * Schedule via: supabase config → Edge Functions → Schedule
 * Recommended cron: "0 3 * * 0" (every Sunday at 03:00 UTC)
 *
 * Provider-agnostic secrets (set via supabase secrets set KEY=value):
 *   LLM_PROVIDER            = ollama | openai | anthropic
 *   OLLAMA_URL              = http://localhost
 *   OLLAMA_MODEL            = llama3.2
 *   OPENAI_BASE_URL         = https://api.openai.com/v1
 *   OPENAI_API_KEY          = gpt-4o-mini
 *   OPENAI_MODEL
 *   ANTHROPIC_API_KEY       = claude-sonnet-4-6
 *   ANTHROPIC_MODEL
 *   SERPER_API_KEY
 *   SUPABASE_URL            = auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY = auto-injected
 *
 * The LLM call mirrors the provider selection in lib/llm.ts:
 * change one env var to reroute every LLM call in the system.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");

const LLM_PROVIDER: "ollama" | "openai" | "anthropic" =
  (Deno.env.get("LLM_PROVIDER") as "ollama" | "openai" | "anthropic") ?? "ollama";
const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ?? "http://localhost:11434";
const OLLAMA_MODEL = Deno.env.get("OLLAMA_MODEL") ?? "llama3.2";
const OPENAI_BASE_URL = Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Types
type ResearchTarget = {
  slug: string;
  name: string;
  manufacturer: string;
  type: string;
  introduced_year?: number;
};

type FailureMode = {
  component: string;
  symptom: string;
  root_cause: string;
  severity: "critical" | "high" | "medium" | "low";
  mtbf_hours?: number | null;
  source_urls: string[];
  confidence: "high" | "medium" | "low" | "unverified";
  tags: string[];
  repair_steps?: Array<{ step: number; action: string; tool?: string; warning?: string }>;
  tools_required?: string[];
  parts?: Array<{ part_name: string; part_number?: string; supplier?: string; unit_cost_usd?: number; qty: number }>;
  labor_minutes?: number | null;
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

type ExtractedFailureMode = {
  component: string;
  symptom: string;
  root_cause: string;
  severity: string;
  mtbf_hours?: number | null;
  source_urls: string[];
  confidence: string;
  tags: string[];
  repair_steps?: Array<{ step: number; action: string; tool?: string; warning?: string }>;
  tools_required?: string[];
  parts?: Array<{ part_name: string; part_number?: string; supplier?: string; unit_cost_usd?: number; qty: number }>;
  labor_minutes?: number | null;
  skill_level?: string;
  predictive_signals?: Array<{
    signal_name: string;
    signal_source?: string;
    threshold_value?: number;
    threshold_operator?: string;
    threshold_unit?: string;
    lead_time_hours?: number;
    confidence?: number;
    notes?: string;
  }>;
};

const PLATFORMS: ResearchTarget[] = [
  // ── Humanoids ──────────────────────────────────────────────────────────────
  { slug: "unitree-g1",            name: "Unitree G1",                 manufacturer: "Unitree Robotics",      type: "humanoid",        introduced_year: 2024 },
  { slug: "unitree-h1-2",          name: "Unitree H1-2",               manufacturer: "Unitree Robotics",      type: "humanoid",        introduced_year: 2024 },
  { slug: "unitree-b2",            name: "Unitree B2",                  manufacturer: "Unitree Robotics",      type: "quadruped",       introduced_year: 2023 },
  { slug: "unitree-r1",            name: "Unitree R1 AIR",              manufacturer: "Unitree Robotics",      type: "humanoid",        introduced_year: 2025 },
  { slug: "figure-02",             name: "Figure 02",                   manufacturer: "Figure AI",             type: "humanoid",        introduced_year: 2024 },
  { slug: "tesla-optimus",         name: "Tesla Optimus Gen2",          manufacturer: "Tesla",                 type: "humanoid",        introduced_year: 2024 },
  // ── Quadrupeds ─────────────────────────────────────────────────────────────
  { slug: "boston-dynamics-spot",  name: "Boston Dynamics Spot",        manufacturer: "Boston Dynamics",       type: "quadruped",       introduced_year: 2019 },
  // ── Agricultural & Enterprise Drones ───────────────────────────────────────
  { slug: "dji-agras-t50",         name: "DJI Agras T50",               manufacturer: "DJI",                   type: "drone",           introduced_year: 2023 },
  { slug: "dji-agras-t60",         name: "DJI Agras T60",               manufacturer: "DJI",                   type: "drone",           introduced_year: 2023 },
  { slug: "dji-matrice-350",       name: "DJI Matrice 350 RTK",         manufacturer: "DJI",                   type: "drone",           introduced_year: 2023 },
  { slug: "skydio-x10",            name: "Skydio X10",                  manufacturer: "Skydio",                type: "drone",           introduced_year: 2023 },
  { slug: "zipline-p2",            name: "Zipline P2 Zip",              manufacturer: "Zipline",               type: "delivery_air",    introduced_year: 2023 },
  // ── Ground Delivery & Warehouse ────────────────────────────────────────────
  { slug: "serve-rs2",             name: "Serve Robotics RS2",          manufacturer: "Serve Robotics",        type: "delivery_ground", introduced_year: 2023 },
  { slug: "starship-gen3",         name: "Starship Gen 3",              manufacturer: "Starship Technologies", type: "delivery_ground", introduced_year: 2023 },
  { slug: "amazon-proteus",        name: "Amazon Proteus AMR",          manufacturer: "Amazon Robotics",       type: "warehouse_amr",   introduced_year: 2022 },
  // ── Micromobility ──────────────────────────────────────────────────────────
  { slug: "lime-gen4",             name: "Lime Gen 4 E-scooter",        manufacturer: "Lime",                  type: "micromobility",   introduced_year: 2023 },
  { slug: "radcommercial",         name: "Rad Power Commercial eBike",  manufacturer: "Rad Power Bikes",       type: "micromobility",   introduced_year: 2022 },
];

// Search
async function webSearch(
  query: string,
): Promise<Array<{ title: string; snippet: string; link: string }>> {
  if (!SERPER_API_KEY) return [];
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 8 }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic ?? []).map((r: { title: string; snippet: string; link: string }) => ({
    title: r.title,
    snippet: r.snippet,
    link: r.link,
  }));
}

// Provider-agnostic LLM
async function callLLM<TOut>(
  prompt: string,
  opts: { system?: string; wantJSON?: boolean; maxTokens?: number },
): Promise<TOut> {
  const wantJSON = opts.wantJSON ?? true;
  const maxTokens = opts.maxTokens ?? (wantJSON ? 2048 : 1024);

  switch (LLM_PROVIDER) {
    case "ollama":
      return (await callOllama<TOut>(prompt, opts.system, wantJSON, maxTokens)) as TOut;
    case "openai":
      return (await callOpenAI<TOut>(prompt, opts.system, wantJSON, maxTokens)) as TOut;
    case "anthropic":
      return (await callAnthropic<TOut>(prompt, opts.system, wantJSON, maxTokens)) as TOut;
    default:
      throw new Error(`[research-cron] Unknown LLM provider: ${LLM_PROVIDER}`);
  }
}

async function callOllama<TOut>(
  prompt: string,
  system?: string,
  wantJSON?: boolean,
  maxTokens?: number,
): Promise<string | unknown> {
  const body: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: { temperature: 0, num_predict: maxTokens ?? 2048 },
  };
  if (system) body.system = system;
  if (wantJSON) body.format = "json";

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = await res.json();
  const text: string = data.response ?? "";
  if (wantJSON) return parseJSON(text);
  return text;
}

async function callOpenAI<TOut>(
  prompt: string,
  system?: string,
  wantJSON?: boolean,
  maxTokens?: number,
): Promise<string | unknown> {
  const messages: Array<Record<string, unknown>> = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(OPENAI_API_KEY ? { Authorization: `Bearer ${OPENAI_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0,
      max_tokens: maxTokens ?? 2048,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI-compatible ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  if (wantJSON) return parseJSON(text);
  return text;
}

async function callAnthropic<TOut>(
  prompt: string,
  system?: string,
  wantJSON?: boolean,
  maxTokens?: number,
): Promise<string | unknown> {
  if (!ANTHROPIC_API_KEY) throw new Error("[research-cron] ANTHROPIC_API_KEY not set");
  const body: Record<string, unknown> = {
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens ?? 2048,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  };
  if (system) body.system = system;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  if (wantJSON) return parseJSON(text);
  return text;
}

function parseJSON<T>(raw: string): T {
  let clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const match = clean.match(/[\{\[][\s\S]*/);
  if (match) clean = match[0];
  return JSON.parse(clean) as T;
}

// Main extraction + persist flow
async function extractAndPersist(platform: ResearchTarget, runId: string): Promise<{
  fmInserted: number;
  protocolsInserted: number;
  signalsInserted: number;
  sources: number;
}> {
  const queries = [
    `"${platform.name}" teardown repair maintenance failure`,
    `"${platform.name}" common problems service manual`,
    `"${platform.name}" repair forum community fix parts`,
  ];
  const results = (await Promise.all(queries.map(webSearch))).flat();
  const seen = new Set<string>();
  const unique = results.filter((r) => {
    if (seen.has(r.link)) return false;
    seen.add(r.link);
    return true;
  });

  if (unique.length === 0)
    return { fmInserted: 0, protocolsInserted: 0, signalsInserted: 0, sources: 0 };

  const context = unique
    .slice(0, 10)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.link}`)
    .join("\n\n");

  // Resolve or create platform
  const { data: existingPlatform } = await supabase
    .from("platforms")
    .select("id")
    .eq("slug", platform.slug)
    .single();

  let platformId: string;
  if (existingPlatform) {
    platformId = existingPlatform.id;
  } else {
    const { data: newPlatform, error } = await supabase
      .from("platforms")
      .upsert({
        slug: platform.slug,
        name: platform.name,
        manufacturer: platform.manufacturer,
        type: platform.type,
        introduced_year: platform.introduced_year,
        specs_json: {},
        techmedix_status: "supported",
      }, { onConflict: "slug" })
      .select("id")
      .single();
    if (error || !newPlatform)
      return { fmInserted: 0, protocolsInserted: 0, signalsInserted: 0, sources: unique.length };
    platformId = newPlatform.id;
  }

  // Log sources
  for (const r of unique.slice(0, 15)) {
    await supabase.from("research_log").insert({
      platform_id: platformId,
      source_url: r.link,
      source_type: "other",
      content_summary: r.snippet,
      agent_run_id: runId,
    });
  }

  // Provider-agnostic extraction
  const systemPrompt = `You are a robotics field-service intelligence analyst for TechMedix.
Extract REAL, SOURCED failure mode data from the provided search results about ${platform.name} (${platform.type}, by ${platform.manufacturer}).
Rules:
- Only extract failure modes that are clearly evidenced in the search results.
- Never fabricate repair steps or part numbers.
- Cite source URLs from the results.
- Mark confidence low or unverified if fewer than 2 results corroborate.
- severity: critical = safety risk or complete stoppage; high = major degradation; medium = reduced performance; low = cosmetic/minor.
- Return ONLY the JSON array, nothing else.`;

  const userPrompt = `Platform search results:\n${context}\n\nReturn a JSON array using this schema:\n[{"component":"string","symptom":"string","root_cause":"string","severity":"critical|high|medium|low","mtbf_hours":null|number,"source_urls":["url"],"confidence":"high|medium|low|unverified","tags":["tag"],"repair_steps":[{"step":1,"action":"string","tool":"string|null","warning":"string|null"}],"tools_required":["tool"],"parts":[{"part_name":"string","part_number":"string|null","supplier":"string|null","unit_cost_usd":null|number,"qty":1}],"labor_minutes":null|number,"skill_level":"basic|intermediate|advanced|specialist","predictive_signals":[{"signal_name":"string","signal_source":"string|null","threshold_value":null|number,"threshold_operator":">|<|>=|<=|==","threshold_unit":"string|null","lead_time_hours":null|number,"confidence":0.0-1.0,"notes":"string|null"}]}]\nIf no reliable failure modes found, return [].`;

  const failures: ExtractedFailureMode[] = [];
  try {
    const parsed = await callLLM<ExtractedFailureMode[]>(userPrompt, {
      system: systemPrompt,
      wantJSON: true,
      maxTokens: 4096,
    });
    if (Array.isArray(parsed)) {
      for (const fm of parsed) failures.push(fm);
    }
  } catch (err) {
    console.error(`[research-cron] LLM extraction failed for ${platform.name}:`, err);
  }

  // Persist
  let fmInserted = 0;
  let protocolsInserted = 0;
  const signalsInserted = 0;

  for (const fm of failures) {
    const { data: inserted } = await supabase
      .from("failure_modes")
      .upsert({
        platform_id: platformId,
        component: fm.component,
        symptom: fm.symptom,
        root_cause: fm.root_cause,
        severity: fm.severity,
        source_urls: fm.source_urls,
        confidence: fm.source_urls.length >= 3 ? fm.confidence : "low",
        tags: fm.tags ?? [],
      }, { onConflict: "platform_id,component,symptom" })
      .select("id")
      .single();

    if (inserted) fmInserted++;
    void protocolsInserted;
  }

  return { fmInserted, protocolsInserted, signalsInserted, sources: unique.length };
}

// Server
Deno.serve(async (_req: Request) => {
  const runId = crypto.randomUUID();
  await supabase.from("agent_runs").insert({ id: runId, status: "running" });

  const summaries: Array<{ slug: string; status: string; fm: number; protocols: number; signals: number }> = [];
  let totalInserted = 0;

  for (const platform of PLATFORMS) {
    try {
      const result = await extractAndPersist(platform, runId);
      summaries.push({
        slug: platform.slug,
        status: "completed",
        fm: result.fmInserted,
        protocols: result.protocolsInserted,
        signals: result.signalsInserted,
      });
      totalInserted += result.fmInserted + result.protocolsInserted + result.signalsInserted;
      console.log(`[research-cron] ${platform.name}: ${result.fmInserted} FM, ${result.sources} sources`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      summaries.push({ slug: platform.slug, status: "failed", fm: 0, protocols: 0, signals: 0 });
      console.error(`[research-cron] ${platform.name} failed: ${msg}`);
    }
  }

  const allFailed = summaries.every((s) => s.status === "failed");
  const hasFailed = summaries.some((s) => s.status === "failed");
  await supabase
    .from("agent_runs")
    .update({
      completed_at: new Date().toISOString(),
      platforms_processed: summaries,
      records_inserted: totalInserted,
      status: allFailed ? "failed" : hasFailed ? "partial" : "completed",
    })
    .eq("id", runId);

  return new Response(
    JSON.stringify({ run_id: runId, platforms: summaries.length, records: totalInserted }),
    { headers: { "Content-Type": "application/json" } },
  );
});
