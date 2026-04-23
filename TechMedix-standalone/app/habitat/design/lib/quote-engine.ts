import type { DesignParams } from "./floor-plan-generator";

export interface LineItem {
  label: string;
  amount: number;
}

export interface Quote {
  line_items: LineItem[];
  subtotal: number;
  deposit: number;
  monthly_estimate: number | null;
}

const TIER_RATES: Record<string, number> = {
  standard: 185,
  pro: 245,
  signature: 340,
};

const FEATURE_COSTS: Record<string, number> = {
  solar: 28000,
  "off-grid": 45000,
  "smart-home": 12000,
  "ev-charging": 8500,
  rainwater: 15000,
  compost: 8000,
};

const FIXED_COSTS: Record<string, number> = {
  permit: 5000,
  site_prep: 8000,
  foundation: 15000,
};

export function computeQuote(params: DesignParams): Quote {
  const sqft = params.sqft || 1200;
  const tier = params.budget_tier || "standard";
  const tierRate = TIER_RATES[tier] ?? TIER_RATES.standard;

  const lineItems: LineItem[] = [];

  const construction = sqft * tierRate;
  lineItems.push({
    label: `Construction (${sqft.toLocaleString()} sqft x $${tierRate})`,
    amount: construction,
  });

  let featuresTotal = 0;
  for (const feature of params.features || []) {
    const cost = FEATURE_COSTS[feature];
    if (cost) {
      featuresTotal += cost;
      lineItems.push({
        label: feature.charAt(0).toUpperCase() + feature.slice(1).replace(/-/g, " "),
        amount: cost,
      });
    }
  }

  const fixedTotal = Object.values(FIXED_COSTS).reduce((a, b) => a + b, 0);
  lineItems.push({
    label: "Permits, Site Prep & Foundation",
    amount: fixedTotal,
  });

  const subtotal = construction + featuresTotal + fixedTotal;
  const deposit = Math.round(subtotal * 0.10);
  const monthly = Math.round(subtotal * 0.0045);

  return {
    line_items: lineItems,
    subtotal,
    deposit,
    monthly_estimate: monthly > 0 ? monthly : null,
  };
}
