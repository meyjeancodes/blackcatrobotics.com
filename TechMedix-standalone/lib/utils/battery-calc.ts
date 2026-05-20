export interface BatteryRobotInput {
  robot_id: string;
  name: string;
  battery_pct: number;
  draw_rate_pct_per_min: number; // % consumed per minute under current load
  status: string;
}

export interface BatteryForecast {
  robot_id: string;
  name: string;
  battery_pct: number;
  draw_rate_pct_per_min: number;
  minutes_remaining: number;
  will_deplete_in_shift: boolean;
  pct_at_shift_end: number;
  recommended_charge_order: number; // 1 = most urgent
  status: string;
}

export function forecastBattery(
  robots: BatteryRobotInput[],
  shiftRemainingMinutes: number,
  warningThreshold: number
): BatteryForecast[] {
  const forecasts: BatteryForecast[] = robots.map((r) => {
    const minutes_remaining = r.draw_rate_pct_per_min > 0
      ? Math.floor(r.battery_pct / r.draw_rate_pct_per_min)
      : Infinity;

    const pct_at_shift_end = Math.max(
      0,
      r.battery_pct - r.draw_rate_pct_per_min * shiftRemainingMinutes
    );

    return {
      robot_id: r.robot_id,
      name: r.name,
      battery_pct: r.battery_pct,
      draw_rate_pct_per_min: r.draw_rate_pct_per_min,
      minutes_remaining,
      will_deplete_in_shift: pct_at_shift_end <= warningThreshold,
      pct_at_shift_end: Math.round(pct_at_shift_end),
      recommended_charge_order: 0,
      status: r.status,
    };
  });

  // Sort by urgency (lowest projected end-pct first), assign charge order
  const sorted = [...forecasts].sort((a, b) => a.pct_at_shift_end - b.pct_at_shift_end);
  sorted.forEach((f, i) => { f.recommended_charge_order = i + 1; });

  return forecasts;
}

export function downtimeCost(
  minutesDowntime: number,
  laborRatePerHour: number
): number {
  return (minutesDowntime / 60) * laborRatePerHour;
}
