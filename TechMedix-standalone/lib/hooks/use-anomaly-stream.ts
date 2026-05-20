"use client";

import { useState, useEffect, useCallback } from "react";

export type AnomalyType =
  | "unexpected-obstacle"
  | "zone-breach"
  | "path-blocked"
  | "speed-deviation"
  | "human-proximity";

export interface AnomalyEvent {
  id: string;
  robot_id: string;
  robot_name: string;
  type: AnomalyType;
  location: { x: number; y: number; zone: string };
  status: "active" | "resolved";
  timestamp: string;
}

const ANOMALY_LABELS: Record<AnomalyType, string> = {
  "unexpected-obstacle": "Unexpected obstacle",
  "zone-breach": "Left assigned zone",
  "path-blocked": "Path blocked >30s",
  "speed-deviation": "Speed deviation",
  "human-proximity": "Human proximity warning",
};

export { ANOMALY_LABELS };

const SEED_EVENTS: AnomalyEvent[] = [
  {
    id: "anm_001",
    robot_id: "robot_atlas_7f4a",
    robot_name: "Atlas Gen 2",
    type: "unexpected-obstacle",
    location: { x: 14, y: 9, zone: "Assembly Line A" },
    status: "active",
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: "anm_002",
    robot_id: "robot_optimus_03",
    robot_name: "Optimus Gen 2",
    type: "zone-breach",
    location: { x: 43, y: 13, zone: "Warehouse Zone B" },
    status: "active",
    timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
  },
  {
    id: "anm_003",
    robot_id: "robot_unitree_g1_11",
    robot_name: "Unitree G1",
    type: "human-proximity",
    location: { x: 27, y: 16, zone: "Test Lab" },
    status: "resolved",
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
  },
];

export function useAnomalyStream() {
  const [events, setEvents] = useState<AnomalyEvent[]>(SEED_EVENTS);

  const resolve = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "resolved" as const } : e))
    );
  }, []);

  useEffect(() => {
    // Simulate a new anomaly every ~45 seconds in demo mode
    const timer = setInterval(() => {
      const types: AnomalyType[] = [
        "unexpected-obstacle", "path-blocked", "speed-deviation",
      ];
      const robots = [
        { id: "robot_atlas_7f4a", name: "Atlas Gen 2" },
        { id: "robot_optimus_03", name: "Optimus Gen 2" },
      ];
      const robot = robots[Math.floor(Math.random() * robots.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const newEvent: AnomalyEvent = {
        id: `anm_${Date.now()}`,
        robot_id: robot.id,
        robot_name: robot.name,
        type,
        location: {
          x: Math.floor(Math.random() * 60),
          y: Math.floor(Math.random() * 40),
          zone: "Auto-detected",
        },
        status: "active",
        timestamp: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 20));
    }, 45000);

    return () => clearInterval(timer);
  }, []);

  return { events, resolve };
}
