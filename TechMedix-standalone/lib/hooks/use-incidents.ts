"use client";

import { useState, useCallback } from "react";

export type IncidentType =
  | "mis-grab"
  | "navigation-block"
  | "dropped-payload"
  | "fall-recovery"
  | "sensor-failure"
  | "unexpected-stop"
  | "other";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface TelemetrySnapshot {
  battery_pct: number;
  motor_temp_c: number;
  health_score: number;
  last_task: string | null;
}

export interface Incident {
  id: string;
  robot_id: string;
  robot_name: string;
  task_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  telemetry_snapshot: TelemetrySnapshot;
  attachments: string[];
  created_at: string;
}

const SEED_INCIDENTS: Incident[] = [
  {
    id: "inc_001",
    robot_id: "robot_atlas_7f4a",
    robot_name: "Atlas Gen 2",
    task_id: "task_pick_982",
    type: "mis-grab",
    severity: "medium",
    description: "Robot failed to grasp bin handle — slipped twice on wet surface.",
    telemetry_snapshot: { battery_pct: 81, motor_temp_c: 88, health_score: 68, last_task: "pick-and-place" },
    attachments: [],
    created_at: "2026-05-06T08:30:00Z",
  },
  {
    id: "inc_002",
    robot_id: "robot_optimus_03",
    robot_name: "Optimus Gen 2",
    task_id: "task_nav_441",
    type: "navigation-block",
    severity: "low",
    description: "Blocked by fallen pallet at Zone B entrance. Waited 45s, then requested human clear.",
    telemetry_snapshot: { battery_pct: 58, motor_temp_c: 62, health_score: 91, last_task: "tote-transport" },
    attachments: [],
    created_at: "2026-05-05T14:10:00Z",
  },
];

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>(SEED_INCIDENTS);

  const addIncident = useCallback((incident: Omit<Incident, "id" | "created_at">) => {
    const newIncident: Incident = {
      ...incident,
      id: `inc_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setIncidents((prev) => [newIncident, ...prev]);
    return newIncident;
  }, []);

  return { incidents, addIncident };
}
