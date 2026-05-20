"use client";

import { useState, useEffect } from "react";
import { forecastBattery, type BatteryForecast, type BatteryRobotInput } from "@/lib/utils/battery-calc";
import { mockFleetRobots } from "@/lib/fleet-mock";

const MOCK_INPUTS: BatteryRobotInput[] = mockFleetRobots.map((r) => ({
  robot_id: r.robot_id,
  name: r.model,
  battery_pct: r.battery_pct,
  draw_rate_pct_per_min: r.status === "active" ? 0.38 + Math.random() * 0.2
    : r.status === "charging" ? -0.5  // charging = gaining %
    : 0.1,
  status: r.status,
}));

export function useBatteryForecast(shiftRemainingMinutes: number, warningThreshold: number) {
  const [forecasts, setForecasts] = useState<BatteryForecast[]>([]);

  useEffect(() => {
    // In production: fetch from /api/telemetry/battery
    const result = forecastBattery(MOCK_INPUTS, shiftRemainingMinutes, warningThreshold);
    setForecasts(result);

    // Simulate live updates every 30s
    const interval = setInterval(() => {
      const updated = MOCK_INPUTS.map((r) => ({
        ...r,
        battery_pct: Math.max(0, r.battery_pct - (r.draw_rate_pct_per_min > 0 ? 0.5 : -0.5)),
      }));
      setForecasts(forecastBattery(updated, shiftRemainingMinutes, warningThreshold));
    }, 30000);

    return () => clearInterval(interval);
  }, [shiftRemainingMinutes, warningThreshold]);

  return forecasts;
}
