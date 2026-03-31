/**
 * BlackCat Grid Engine
 *
 * Matches energy supply (high battery) to demand (low battery) across robots.
 * Runs every 60s alongside the simulation engine.
 *
 * SERVER-SIDE ONLY.
 */

import { createServiceClient } from "../../supabase-service";
import type { EnergyState } from "../../../types/blackcat";

const PRICE_PER_KWH = 0.089; // $/kWh — fixed for now
const SUPPLY_THRESHOLD = 80;  // battery_level above this = supplier
const DEMAND_THRESHOLD = 30;  // battery_level below this = demander

export async function runGridEngine(): Promise<void> {
  const supabase = createServiceClient();

  // Fetch all energy states joined with robot region for proximity matching
  const { data: states, error } = await supabase
    .from("energy_states")
    .select("*, robots(region, name)");

  if (error || !states) {
    console.error("[grid] Failed to fetch energy states:", error?.message);
    return;
  }

  // Sync energy states with current robot battery levels
  const { data: robots } = await supabase
    .from("robots")
    .select("id, battery_level, region, customer_id");

  if (robots) {
    for (const robot of robots) {
      await supabase
        .from("energy_states")
        .upsert(
          {
            robot_id: robot.id,
            battery_level: robot.battery_level,
            consumption_rate: 2.0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "robot_id" }
        );
    }
  }

  const { data: freshStates } = await supabase
    .from("energy_states")
    .select("*, robots(region)");

  if (!freshStates) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suppliers = freshStates.filter((s: any) => s.battery_level > SUPPLY_THRESHOLD);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const demanders = freshStates.filter((s: any) => s.battery_level < DEMAND_THRESHOLD);

  if (suppliers.length === 0 || demanders.length === 0) return;

  // Match each demander to the best available supplier
  for (const demander of demanders) {
    // Prefer same region, then any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const demandRegion = (demander as any).robots?.region;
    const sortedSuppliers = [...suppliers].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aRegion = (a as any).robots?.region;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bRegion = (b as any).robots?.region;
      const aMatch = aRegion === demandRegion ? 0 : 1;
      const bMatch = bRegion === demandRegion ? 0 : 1;
      return aMatch - bMatch;
    });

    const supplier = sortedSuppliers[0];
    if (!supplier || supplier.robot_id === demander.robot_id) continue;

    const tradedKwh = parseFloat((Math.random() * 5 + 2).toFixed(2));
    const totalPrice = parseFloat((tradedKwh * PRICE_PER_KWH).toFixed(4));

    await supabase.from("energy_transactions").insert({
      buyer_id: demander.robot_id,
      seller_id: supplier.robot_id,
      kwh: tradedKwh,
      price_per_kwh: PRICE_PER_KWH,
      total_price: totalPrice,
    });
  }
}

export async function getGridState() {
  const supabase = createServiceClient();

  const [statesRes, txRes] = await Promise.all([
    supabase.from("energy_states").select("*"),
    supabase
      .from("energy_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const states = (statesRes.data ?? []) as EnergyState[];
  const transactions = txRes.data ?? [];

  const supply = states.filter((s) => s.battery_level > SUPPLY_THRESHOLD);
  const demand = states.filter((s) => s.battery_level < DEMAND_THRESHOLD);

  const totalSupplyKwh = supply.reduce((sum, s) => sum + (s.battery_level / 100) * 10, 0);
  const totalDemandKwh = demand.reduce((sum, s) => sum + ((100 - s.battery_level) / 100) * 10, 0);
  const totalTradedKwh = transactions.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, t: any) => sum + (Number(t.kwh) || 0),
    0
  );

  return {
    supply,
    demand,
    transactions,
    totals: {
      supply_kwh: parseFloat(totalSupplyKwh.toFixed(2)),
      demand_kwh: parseFloat(totalDemandKwh.toFixed(2)),
      transaction_count: transactions.length,
      total_traded_kwh: parseFloat(totalTradedKwh.toFixed(2)),
    },
  };
}
