export interface ROIInputs {
  unit_cost: number;
  num_units: number;
  maintenance_pct: number;        // annual maintenance as % of unit cost
  hours_per_day: number;
  days_per_year: number;
  labor_rate_per_hr: number;
  ftes_replaced: number;
  productivity_multiplier: number; // robot productivity vs human (0–1)
  integration_cost: number;
  discount_rate: number;          // NPV discount rate
}

export interface ROIYearRow {
  year: number;
  robot_cost: number;
  maintenance_cost: number;
  labor_savings: number;
  net_cash_flow: number;
  cumulative: number;
}

export interface ROIResult {
  year_rows: ROIYearRow[];
  breakeven_month: number | null;
  npv_5yr: number;
  cost_per_op_hour: number;
  western_benchmark_cost: number;
  chinese_benchmark_cost: number;
}

const WESTERN_BOM_PER_UNIT = 130_000;
const CHINESE_BOM_PER_UNIT = 46_000;

export function calcROI(inputs: ROIInputs): ROIResult {
  const {
    unit_cost, num_units, maintenance_pct, hours_per_day, days_per_year,
    labor_rate_per_hr, ftes_replaced, productivity_multiplier,
    integration_cost, discount_rate,
  } = inputs;

  const annual_op_hours = hours_per_day * days_per_year * num_units;
  const annual_labor_savings =
    labor_rate_per_hr * hours_per_day * days_per_year * ftes_replaced * productivity_multiplier;
  const annual_maintenance = unit_cost * num_units * (maintenance_pct / 100);
  const initial_investment = unit_cost * num_units + integration_cost;

  const year_rows: ROIYearRow[] = [];
  let cumulative = -initial_investment;
  let breakeven_month: number | null = null;

  for (let y = 1; y <= 5; y++) {
    const net_cf = annual_labor_savings - annual_maintenance;
    cumulative += net_cf;

    if (breakeven_month === null && cumulative >= 0) {
      // Linear interpolation to find the breakeven month
      const prev_cum = cumulative - net_cf;
      const fraction = -prev_cum / net_cf;
      breakeven_month = Math.round((y - 1 + fraction) * 12);
    }

    year_rows.push({
      year: y,
      robot_cost: y === 1 ? initial_investment : 0,
      maintenance_cost: annual_maintenance,
      labor_savings: annual_labor_savings,
      net_cash_flow: net_cf,
      cumulative,
    });
  }

  // NPV: sum of discounted net cash flows minus initial investment
  const npv_5yr = year_rows.reduce((sum, row) => {
    return sum + row.net_cash_flow / Math.pow(1 + discount_rate / 100, row.year);
  }, -initial_investment);

  return {
    year_rows,
    breakeven_month,
    npv_5yr: Math.round(npv_5yr),
    cost_per_op_hour: annual_op_hours > 0
      ? Math.round((initial_investment + annual_maintenance * 5) / (annual_op_hours * 5))
      : 0,
    western_benchmark_cost: WESTERN_BOM_PER_UNIT * num_units,
    chinese_benchmark_cost: CHINESE_BOM_PER_UNIT * num_units,
  };
}

export function fmt$(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}
