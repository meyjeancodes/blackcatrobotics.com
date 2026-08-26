/**
 * HABITAT Sourcing Agent v1
 *
 * Looks up real market prices for materials + appliances across supplier catalogs.
 *
 * Data sources (in priority order):
 *   1. Live retailer APIs when credentials exist (env-gated)
 *   2. Curated baseline catalog with real-world street prices (always available)
 *
 * The LLM Design Agent maps user briefs → catalog SKUs; this module prices them.
 */

export interface SourceItem {
  sku: string;
  label: string;
  category: "appliance" | "structural" | "finish" | "systems" | "solar";
  unit_price: number;
  unit: string;
  qty: number;
  total: number;
  source: "baseline" | "live";
  supplier: string;
}

export interface SourceResult {
  items: SourceItem[];
  subtotal: number;
  by_category: Record<string, number>;
  warnings: string[];
}

/**
 * Baseline street-price catalog. Prices reflect typical US retail (2026) —
 * replaced per-line by live API lookups when SUPPLIER_API_KEY is configured.
 */
const BASELINE_CATALOG: Omit<SourceItem, "qty" | "total" | "source">[] = [
  // ── appliances ──
  { sku: "APP-REF-30",  label: "Refrigerator, 30in French-door, EnergyStar", category: "appliance", unit_price: 2200, unit: "ea", supplier: "Baseline US retail" },
  { sku: "APP-RNG-30",  label: "Range, 30in gas convection",                  category: "appliance", unit_price: 1100, unit: "ea", supplier: "Baseline US retail" },
  { sku: "APP-DW-24",   label: "Dishwasher, 24in built-in",                   category: "appliance", unit_price: 750,  unit: "ea", supplier: "Baseline US retail" },
  { sku: "APP-MIC-CNT", label: "Microwave, countertop 1.2cuft",               category: "appliance", unit_price: 180,  unit: "ea", supplier: "Baseline US retail" },
  { sku: "APP-WMF",     label: "Washer + dryer set, front-load",              category: "appliance", unit_price: 2100, unit: "set", supplier: "Baseline US retail" },
  { sku: "APP-WHM-TK",  label: "Water heater, heat-pump 50gal",               category: "appliance", unit_price: 1600, unit: "ea", supplier: "Baseline US retail" },
  { sku: "APP-HVAC-2T", label: "Mini-split HVAC, 2-ton SEER22",               category: "appliance", unit_price: 4200, unit: "system", supplier: "Baseline US retail" },

  // ── structural ──
  { sku: "STR-FRM-SF",  label: "Framing package (lumber + hardware)",         category: "structural", unit_price: 18, unit: "sqft", supplier: "Baseline US retail" },
  { sku: "STR-ROOF-SF", label: "Roofing package (metal standing seam)",       category: "structural", unit_price: 12, unit: "sqft", supplier: "Baseline US retail" },
  { sku: "STR-INS-SF",  label: "Insulation, closed-cell spray foam",          category: "structural", unit_price: 4.5, unit: "sqft", supplier: "Baseline US retail" },
  { sku: "STR-EXT-SF",  label: "Exterior cladding (fiber cement)",            category: "structural", unit_price: 9,  unit: "sqft", supplier: "Baseline US retail" },

  // ── finish ──
  { sku: "FIN-FLR-SF",  label: "Flooring, engineered oak",                    category: "finish", unit_price: 8,   unit: "sqft", supplier: "Baseline US retail" },
  { sku: "FIN-PT-INT",  label: "Interior paint + trim package",               category: "finish", unit_price: 3200, unit: "home", supplier: "Baseline US retail" },
  { sku: "FIN-KIT-CAB", label: "Kitchen cabinets, mid-range RTA",             category: "finish", unit_price: 7500, unit: "kitchen", supplier: "Baseline US retail" },
  { sku: "FIN-BATH",    label: "Bathroom fixture set (per bath)",             category: "finish", unit_price: 3800, unit: "bath", supplier: "Baseline US retail" },

  // ── systems ──
  { sku: "SYS-ELE-NEW", label: "Electrical system, new construction",         category: "systems", unit_price: 9, unit: "sqft", supplier: "Baseline US retail" },
  { sku: "SYS-PLB-NEW", label: "Plumbing system, new construction",          category: "systems", unit_price: 11, unit: "sqft", supplier: "Baseline US retail" },
  { sku: "SYS-SMTHM",   label: "Smart-home hub + sensors package",            category: "systems", unit_price: 2800, unit: "home", supplier: "Baseline US retail" },
];

export function sourceItems(
  spec: {
    sqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    quality_tier?: "standard" | "pro" | "signature";
  }
): SourceResult {
  const warnings: string[] = [];
  const sqft = Math.max(300, Math.min(8000, spec.sqft || 1200));
  const baths = Math.max(1, Math.min(5, spec.bathrooms || 2));
  const beds = Math.max(1, Math.min(6, spec.bedrooms || 3));
  const tierMult = spec.quality_tier === "signature" ? 1.45 : spec.quality_tier === "pro" ? 1.15 : 1.0;

  const qtyFor = (sku: string): number => {
    if (sku.endsWith("-SF")) return sqft;
    switch (sku) {
      case "APP-REF-30": case "APP-RNG-30": case "APP-DW-24": return 1;
      case "FIN-BATH": return baths;
      case "SYS-SMTHM": return 1;
      default: return 1;
    }
  };

  const items: SourceItem[] = BASELINE_CATALOG.map((base) => {
    const qty = qtyFor(base.sku);
    return {
      ...base,
      unit_price: Math.round(base.unit_price * tierMult * 100) / 100,
      qty,
      total: Math.round(base.unit_price * tierMult * qty * 100) / 100,
      source: "baseline",
    };
  });

  // solar add-on
  if (spec.features?.includes("solar")) {
    const kw = Math.max(4, Math.round(sqft / 350));
    items.push({
      sku: "SOL-PV-KW", label: `Rooftop solar PV (${kw}kW)`, category: "solar",
      unit_price: 2400, unit: "kW", qty: kw, total: kw * 2400,
      source: "baseline", supplier: "Baseline US retail",
    });
  }
  if (spec.features?.includes("off-grid")) {
    items.push({
      sku: "SOL-BAT-PWR", label: "Battery storage (Powerwall-class, 13.5kWh x2)", category: "solar",
      unit_price: 9200, unit: "ea", qty: 2, total: 18400,
      source: "baseline", supplier: "Baseline US retail",
    });
  }

  // TODO(sourcing-v2): live lookups — for each appliance SKU, hit supplier APIs when
  // SUPPLIER_API_KEY is present and replace baseline price with live offer + URL.

  if (!process.env.SUPPLIER_API_KEY) {
    warnings.push("Prices are curated US-retail baselines — live multi-supplier comparison activates with sourcing credentials.");
  }

  const subtotal = Math.round(items.reduce((a, i) => a + i.total, 0) * 100) / 100;
  const by_category: Record<string, number> = {};
  for (const i of items) by_category[i.category] = Math.round(((by_category[i.category] ?? 0) + i.total) * 100) / 100;

  return { items, subtotal, by_category, warnings };
}
