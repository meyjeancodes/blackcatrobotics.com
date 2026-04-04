/**
 * POST /api/techmedix/research/ingest
 * Accepts structured research output from the web intelligence agent loop
 * and upserts it into the knowledge moat database.
 *
 * Authorization: x-blackcat-secret header required
 *
 * Body shape:
 * {
 *   agent_run_id: string,
 *   platforms: Array<{
 *     slug, name, manufacturer, type, introduced_year, specs_json,
 *     failure_modes: Array<{
 *       component, symptom, root_cause, severity, mtbf_hours,
 *       source_urls, confidence, tags,
 *       repair_protocol: { title, steps, tools_required, parts, labor_minutes, skill_level, source_url },
 *       predictive_signals: Array<{ signal_name, signal_source, threshold_value, threshold_operator, threshold_unit, lead_time_hours, confidence }>
 *     }>,
 *     suppliers: Array<{ name, website, region, component_types, lead_time_days, risk_level, notes }>,
 *     research_sources: string[]
 *   }>
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import {
  upsertPlatform,
  upsertFailureMode,
  insertRepairProtocol,
  insertPredictiveSignal,
  logResearch,
} from "@/lib/blackcat/knowledge/db";
import { createServiceClient } from "@/lib/supabase-service";

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-blackcat-secret");
  return !!secret && secret === process.env.BLACKCAT_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const agentRunId = (body.agent_run_id as string) ?? `manual-${Date.now()}`;
  const platforms = (body.platforms as unknown[]) ?? [];
  const results: Record<string, unknown>[] = [];

  for (const raw of platforms) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = raw as any;
    try {
      // 1. Upsert platform
      const platformId = await upsertPlatform({
        slug: p.slug,
        name: p.name,
        manufacturer: p.manufacturer,
        type: p.type,
        introduced_year: p.introduced_year ?? null,
        specs_json: p.specs_json ?? {},
        techmedix_status: "supported",
        image_url: p.image_url ?? null,
        notes: p.notes ?? null,
      });

      const failureModeIds: string[] = [];

      // 2. Upsert failure modes
      for (const fm of p.failure_modes ?? []) {
        const fmId = await upsertFailureMode({
          platform_id: platformId,
          component: fm.component,
          symptom: fm.symptom,
          root_cause: fm.root_cause,
          severity: fm.severity ?? "medium",
          mtbf_hours: fm.mtbf_hours ?? null,
          source_urls: fm.source_urls ?? [],
          confidence: deriveConfidence(fm),
          tags: fm.tags ?? [],
        });
        failureModeIds.push(fmId);

        // 3. Insert repair protocol
        if (fm.repair_protocol) {
          const proto = fm.repair_protocol;
          await insertRepairProtocol({
            failure_mode_id: fmId,
            title: proto.title,
            steps_json: (proto.steps ?? []).map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s: any, i: number) => ({
                step: s.step ?? i + 1,
                action: s.action,
                tool: s.tool ?? null,
                warning: s.warning ?? null,
                image_hint: s.image_hint ?? null,
              })
            ),
            tools_required: proto.tools_required ?? [],
            parts_json: proto.parts ?? [],
            labor_minutes: proto.labor_minutes ?? null,
            skill_level: proto.skill_level ?? "intermediate",
            source_url: proto.source_url ?? null,
            verified_by: "research_agent",
            version: 1,
          });
        }

        // 4. Insert predictive signals
        for (const sig of fm.predictive_signals ?? []) {
          await insertPredictiveSignal({
            failure_mode_id: fmId,
            signal_name: sig.signal_name,
            signal_source: sig.signal_source ?? null,
            threshold_value: sig.threshold_value ?? null,
            threshold_operator: sig.threshold_operator ?? ">",
            threshold_unit: sig.threshold_unit ?? null,
            lead_time_hours: sig.lead_time_hours ?? null,
            confidence: sig.confidence ?? null,
            notes: sig.notes ?? null,
          });
        }
      }

      // 5. Upsert suppliers
      const supabase = createServiceClient();
      for (const s of p.suppliers ?? []) {
        await supabase.from("suppliers").upsert(
          {
            name: s.name,
            website: s.website ?? null,
            region: s.region ?? "global",
            component_types: s.component_types ?? [],
            platforms_served: [p.slug],
            unit_cost_usd: s.unit_cost_usd ?? null,
            lead_time_days: s.lead_time_days ?? null,
            min_order_qty: s.min_order_qty ?? 1,
            risk_level: s.risk_level ?? "medium",
            notes: s.notes ?? null,
          },
          { onConflict: "name,region" }
        );
      }

      // 6. Log research sources
      for (const url of p.research_sources ?? []) {
        await logResearch({
          platform_id: platformId,
          source_url: url,
          source_type: "other",
          content_summary: `Research run ${agentRunId} — ${p.name}`,
          agent_run_id: agentRunId,
        });
      }

      results.push({
        slug: p.slug,
        platform_id: platformId,
        failure_modes_upserted: failureModeIds.length,
        status: "ok",
      });
    } catch (err) {
      results.push({
        slug: p.slug,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const hasErrors = results.some((r) => r.status === "error");
  return NextResponse.json(
    { agent_run_id: agentRunId, results },
    { status: hasErrors ? 207 : 200 }
  );
}

type ConfidenceLevel = "high" | "medium" | "low" | "unverified";

function deriveConfidence(fm: { source_urls?: string[]; confidence?: string }): ConfidenceLevel {
  const count = fm.source_urls?.length ?? 0;
  if (count < 3) return "low";
  const c = fm.confidence;
  if (c === "high" || c === "medium" || c === "low" || c === "unverified") return c;
  return "medium";
}
