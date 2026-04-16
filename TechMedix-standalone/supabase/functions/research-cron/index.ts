/**
 * Supabase Edge Function: research-cron
 *
 * Weekly scheduled research refresh.
 * Schedule via: supabase/config.toml or Supabase Dashboard → Edge Functions → Schedule
 *
 * Recommended cron: "0 3 * * 0"  (every Sunday at 03:00 UTC)
 *
 * Required secrets (set via: supabase secrets set KEY=value):
 *   ANTHROPIC_API_KEY
 *   SERPER_API_KEY
 *   SUPABASE_URL (auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

type ResearchTarget = {
  slug: string;
  name: string;
  manufacturer: string;
  type: string;
  introduced_year?: number;
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

async function webSearch(query: string): Promise<Array<{ title: string; snippet: string; link: string }>> {
  if (!SERPER_API_KEY) return [];
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 8 }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic ?? []).map((r: { title: string; snippet: string; link: string }) => ({
    title: r.title, snippet: r.snippet, link: r.link,
  }));
}

async function extractAndPersist(platform: ResearchTarget, runId: string): Promise<{
  fmInserted: number; protocolsInserted: number; signalsInserted: number; sources: number;
}> {
  const queries = [
    `"${platform.name}" teardown repair maintenance failure`,
    `"${platform.name}" common problems service manual`,
    `"${platform.name}" repair forum community fix parts`,
  ];
  const results = (await Promise.all(queries.map(webSearch))).flat();
  const seen = new Set<string>();
  const unique = results.filter((r) => { if (seen.has(r.link)) return false; seen.add(r.link); return true; });

  if (unique.length === 0) return { fmInserted: 0, protocolsInserted: 0, signalsInserted: 0, sources: 0 };

  const context = unique.slice(0, 10)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.link}`)
    .join("\n\n");

  // Resolve or create platform
  const { data: existingPlatform } = await supabase
    .from("platforms").select("id").eq("slug", platform.slug).single();

  let platformId: string;
  if (existingPlatform) {
    platformId = existingPlatform.id;
  } else {
    const { data: newPlatform, error } = await supabase
      .from("platforms")
      .upsert({
        slug: platform.slug, name: platform.name, manufacturer: platform.manufacturer,
        type: platform.type, introduced_year: platform.introduced_year,
        specs_json: {}, techmedix_status: "supported",
      }, { onConflict: "slug" })
      .select("id").single();
    if (error || !newPlatform) return { fmInserted: 0, protocolsInserted: 0, signalsInserted: 0, sources: unique.length };
    platformId = newPlatform.id;
  }

  // Log sources
  for (const r of unique.slice(0, 15)) {
    await supabase.from("research_log").insert({
      platform_id: platformId, source_url: r.link, source_type: "other",
      content_summary: r.snippet, agent_run_id: runId,
    });
  }

  // Call Claude for extraction
  const extractionPrompt = `Extract failure modes for ${platform.name} from these search results as a JSON array:
${context}

Return only JSON: [{"component":str,"symptom":str,"root_cause":str,"severity":"critical|high|medium|low","source_urls":[...],"confidence":"high|medium|low|unverified","tags":[...]}]
Empty array [] if no reliable data found.`;

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: extractionPrompt }],
    }),
  });

  if (!claudeRes.ok) return { fmInserted: 0, protocolsInserted: 0, signalsInserted: 0, sources: unique.length };

  const claudeData = await claudeRes.json();
  const text: string = claudeData.content?.[0]?.text ?? "[]";
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  let failures: Array<{
    component: string; symptom: string; root_cause: string;
    severity: string; source_urls: string[]; confidence: string; tags: string[];
  }> = [];
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) failures = parsed;
  } catch { /* ignore parse error */ }

  let fmInserted = 0;
  let protocolsInserted = 0;
  const signalsInserted = 0;

  for (const fm of failures) {
    const { data: inserted } = await supabase
      .from("failure_modes")
      .upsert({
        platform_id: platformId,
        component: fm.component, symptom: fm.symptom, root_cause: fm.root_cause,
        severity: fm.severity, source_urls: fm.source_urls,
        confidence: fm.source_urls.length >= 3 ? fm.confidence : "low",
        tags: fm.tags ?? [],
      }, { onConflict: "platform_id,component,symptom" })
      .select("id").single();

    if (inserted) fmInserted++;
    void protocolsInserted;
  }

  return { fmInserted, protocolsInserted, signalsInserted, sources: unique.length };
}

Deno.serve(async (_req: Request) => {
  const runId = crypto.randomUUID();

  // Create agent run record
  await supabase.from("agent_runs").insert({ id: runId, status: "running" });

  const summaries: Array<{ slug: string; status: string; fm: number; protocols: number; signals: number }> = [];
  let totalInserted = 0;

  for (const platform of PLATFORMS) {
    try {
      const result = await extractAndPersist(platform, runId);
      summaries.push({ slug: platform.slug, status: "completed", fm: result.fmInserted, protocols: result.protocolsInserted, signals: result.signalsInserted });
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
  await supabase.from("agent_runs").update({
    completed_at: new Date().toISOString(),
    platforms_processed: summaries,
    records_inserted: totalInserted,
    status: allFailed ? "failed" : hasFailed ? "partial" : "completed",
  }).eq("id", runId);

  return new Response(JSON.stringify({ run_id: runId, platforms: summaries.length, records: totalInserted }), {
    headers: { "Content-Type": "application/json" },
  });
});
