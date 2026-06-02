import { registerSkill } from "../index";
import type { SkillConfig, SkillInput, SkillResult } from "../types";

const config: SkillConfig = {
  name: "parts-inventory-sync",
  version: "0.1.0",
  description:
    "Sync parts usage from repairs or lookup results to supplier recommendations and replenishment needs.",
  inputSchema: {
    platform: "string?",
    fault_code: "string?",
    parts_used: "array?",
    supplier_region: "string?",
  },
};

export type InventorySyncInput = {
  platform?: string;
  fault_code?: string;
  parts_used?: Array<Record<string, unknown>>;
  supplier_region?: string;
};

type PartDraft = {
  part_name: string;
  part_number?: string | null;
  supplier?: string | null;
  unit_cost_usd?: number | null;
  qty: number;
  source: string;
};

function toCandidate(part: Record<string, unknown>, source: string): PartDraft {
  const pickString = (keys: string[]) => {
    for (const key of keys) {
      const value = part[key];
      if (typeof value === "string") return value;
    }
    return null;
  };

  const pickNumber = (keys: string[]) => {
    for (const key of keys) {
      const value = part[key];
      if (typeof value === "number") return value;
    }
    return null;
  };

  return {
    part_name: pickString(["part_name", "partName"]) ?? "",
    part_number: pickString(["part_number", "partNumber"]),
    supplier: pickString(["supplier", "supplierName"]),
    unit_cost_usd: pickNumber(["unit_cost_usd", "unitCostUsd"]),
    qty: pickNumber(["qty", "qtyUsed", "quantity"]) ?? 1,
    source,
  };
}

async function syncSupabase(input: InventorySyncInput): Promise<SkillResult> {
  try {
    const candidates = new Map<string, PartDraft>();

    if (input.parts_used) {
      for (const part of input.parts_used) {
        const draft = toCandidate(part, "repair");
        const key = [draft.part_name, draft.part_number ?? "", draft.supplier ?? ""].join("|");
        const existing = candidates.get(key) as PartDraft | undefined;
        if (existing) {
          existing.qty += draft.qty;
        } else {
          candidates.set(key, draft);
        }
      }
    }

    const recommendations = Array.from(candidates.values()).map((part) => {
      const qty = part.qty;
      const unitCost = part.unit_cost_usd ?? null;
      const lineTotal = typeof unitCost === "number" ? unitCost * qty : null;

      return {
        part_name: part.part_name,
        part_number: part.part_number ?? null,
        supplier: part.supplier ?? null,
        source: part.source ?? "repair",
        requested_qty: qty,
        min_order_qty: 1,
        unit_cost_usd: unitCost,
        line_total_usd: lineTotal,
        lead_time_days: null,
        risk_level: null,
        region: input.supplier_region ?? null,
        replenish: typeof lineTotal === "number" && lineTotal > 0,
      };
    });

    const totalReplenish = recommendations.filter((r) => r.replenish).length;
    const totalCost = recommendations.reduce((sum, r) => sum + (r.line_total_usd ?? 0), 0);

    return {
      ok: true,
      message: `${recommendations.length} part(s), ${totalReplenish} replenishable, estimated $${totalCost.toFixed(2)}`,
      data: {
        recommendations,
        summary: { totalParts: recommendations.length, totalReplenish, totalCost },
      },
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message ?? "sync_failed" };
  }
}

registerSkill({ name: config.name, config, run: syncSupabase });
export { config as skillConfig, syncSupabase as runPartsInventorySync };
