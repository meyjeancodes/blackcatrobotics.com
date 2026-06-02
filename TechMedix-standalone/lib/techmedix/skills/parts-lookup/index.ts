import { registerSkill } from "../index";
import type { SkillConfig, SkillInput, SkillResult } from "../types";
import {
  getFailureModesByPlatform,
  listSuppliers,
} from "@/lib/blackcat/knowledge/db";
import type {
  FailureModeWithProtocol,
  Supplier as KnowledgeSupplier,
  RepairProtocol as KnowledgeRepairProtocol,
} from "@/lib/blackcat/knowledge/db";

const config: SkillConfig = {
  name: "parts-lookup",
  version: "0.1.0",
  description:
    "Search parts inventory and supplier catalog by fault code, platform, symptom, or part name.",
  inputSchema: {
    platform: "string?",
    fault_code: "string?",
    symptom: "string?",
    part_name: "string?",
    region: "string?",
  },
};

export type PartsQuery = {
  platform?: string;
  fault_code?: string;
  symptom?: string;
  part_name?: string;
  region?: string;
};

type PartRow = {
  part_name: string;
  part_number?: string | null;
  supplier?: string | null;
  unit_cost_usd?: number | null;
  qty?: number | null;
};

type SupplierRow = {
  id: string;
  name: string;
  region: string;
  component_types: string[];
  unit_cost_usd: number | null;
  lead_time_days: number | null;
  min_order_qty: number;
  risk_level: string;
};

type RepairProtocolRow = {
  id: string;
  failure_mode_id: string;
  parts_json: PartRow[];
  labor_minutes: number | null;
  skill_level: string;
};

function normalizeProtocol(protocol: KnowledgeRepairProtocol): RepairProtocolRow {
  const parts = (protocol.parts_json ?? []).map((part) => ({
    part_name: part.part_name,
    part_number: part.part_number ?? null,
    supplier: part.supplier ?? null,
    unit_cost_usd: part.unit_cost_usd ?? null,
    qty: part.qty ?? null,
  }));

  return {
    id: protocol.id,
    failure_mode_id: protocol.failure_mode_id,
    parts_json: parts,
    labor_minutes: protocol.labor_minutes,
    skill_level: protocol.skill_level,
  };
}

async function lookupSupabase(input: PartsQuery): Promise<SkillResult> {
  try {
    const failureModes: FailureModeWithProtocol[] =
      input.platform
        ? ((await getFailureModesByPlatform(input.platform)) as FailureModeWithProtocol[])
        : [];

    const candidates = new Map<string, PartRow & { protocolId?: string }>();
    for (const fm of failureModes) {
      let matches = true;
      if (input.symptom) {
        const symptom = String(fm.symptom ?? "").toLowerCase();
        const query = input.symptom.toLowerCase();
        if (!symptom.includes(query)) matches = false;
      }
      if (input.fault_code && fm.id) {
        if (!fm.id.toLowerCase().includes(String(input.fault_code).toLowerCase())) matches = false;
      }
      if (!matches) continue;

      for (const protocol of fm.repair_protocols ?? []) {
        const protocolRow = normalizeProtocol(protocol);
        for (const part of protocolRow.parts_json ?? []) {
          const key = [part.part_name, part.part_number ?? "", part.supplier ?? ""].join("|");
          const existing = candidates.get(key) as PartRow & { protocolId?: string } | undefined;
          if (existing) {
            existing.qty = (existing.qty ?? 0) + (part.qty ?? 1);
          } else {
            candidates.set(key, { ...part, qty: part.qty ?? 1, protocolId: protocolRow.id });
          }
        }
      }
    }

    const suppliers: KnowledgeSupplier[] = (await listSuppliers(input.region)) ?? [];

    const matchedParts = Array.from(candidates.values()).map((p) => {
      const supplier = suppliers.find((s) => s.name === p.supplier);
      return {
        part_name: p.part_name,
        part_number: p.part_number ?? null,
        supplier: p.supplier ?? null,
        unit_cost_usd: p.unit_cost_usd ?? supplier?.unit_cost_usd ?? null,
        qty: p.qty ?? 1,
        lead_time_days: supplier?.lead_time_days ?? null,
        risk_level: supplier?.risk_level ?? null,
        region: supplier?.region ?? null,
      };
    });

    return {
      ok: true,
      message: `matched ${matchedParts.length} part(s)`,
      data: { parts: matchedParts, suppliers },
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message ?? "lookup_failed" };
  }
}

registerSkill({ name: config.name, config, run: lookupSupabase });
export { config as skillConfig, lookupSupabase as runPartsLookup };
