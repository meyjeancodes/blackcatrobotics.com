"use client";

import { useState, useEffect } from "react";
import { mockFleetRobots } from "@/lib/fleet-mock";

export type TaskType =
  | "pick-and-place"
  | "tote-transport"
  | "container-unload"
  | "inspection"
  | "assembly"
  | "navigation"
  | "custom";

export interface TaskEvent {
  robot_id: string;
  task_type: TaskType;
  result: "success" | "failure";
  failure_mode?: string;
  duration_ms: number;
  timestamp: string;
}

export interface TaskMetric {
  robot_id: string;
  robot_name: string;
  task_type: TaskType;
  total: number;
  successes: number;
  failures: number;
  success_rate: number;
  avg_duration_ms: number;
  failure_modes: Record<string, number>;
}

function generateMockEvents(): TaskEvent[] {
  const robotIds = mockFleetRobots.map((r) => r.robot_id);
  const taskTypes: TaskType[] = [
    "pick-and-place", "tote-transport", "container-unload",
    "inspection", "assembly", "navigation",
  ];
  const failureModes = ["mis-grab", "navigation-block", "sensor-failure", "timeout", "collision-avoidance"];

  const events: TaskEvent[] = [];
  const now = Date.now();
  for (let i = 0; i < 200; i++) {
    const robotId = robotIds[Math.floor(Math.random() * robotIds.length)];
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    // Atlas has lower success on pick-and-place to demonstrate reassignment suggestion
    const baseRate = robotId === "robot_atlas_7f4a" && taskType === "pick-and-place" ? 0.55 : 0.82;
    const result = Math.random() < baseRate ? "success" : "failure";
    events.push({
      robot_id: robotId,
      task_type: taskType,
      result,
      failure_mode: result === "failure"
        ? failureModes[Math.floor(Math.random() * failureModes.length)]
        : undefined,
      duration_ms: 2000 + Math.floor(Math.random() * 8000),
      timestamp: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return events;
}

export function useTaskMetrics() {
  const [metrics, setMetrics] = useState<TaskMetric[]>([]);

  useEffect(() => {
    const events = generateMockEvents();
    const robotMap = Object.fromEntries(mockFleetRobots.map((r) => [r.robot_id, r.model]));

    const grouped: Record<string, TaskEvent[]> = {};
    for (const ev of events) {
      const key = `${ev.robot_id}__${ev.task_type}`;
      (grouped[key] ??= []).push(ev);
    }

    const result: TaskMetric[] = Object.entries(grouped).map(([key, evs]) => {
      const [robot_id, task_type] = key.split("__") as [string, TaskType];
      const successes = evs.filter((e) => e.result === "success").length;
      const failures = evs.filter((e) => e.result === "failure").length;
      const failure_modes: Record<string, number> = {};
      for (const e of evs) {
        if (e.failure_mode) failure_modes[e.failure_mode] = (failure_modes[e.failure_mode] ?? 0) + 1;
      }
      return {
        robot_id,
        robot_name: robotMap[robot_id] ?? robot_id,
        task_type,
        total: evs.length,
        successes,
        failures,
        success_rate: Math.round((successes / evs.length) * 100),
        avg_duration_ms: Math.round(evs.reduce((s, e) => s + e.duration_ms, 0) / evs.length),
        failure_modes,
      };
    });

    setMetrics(result);
  }, []);

  return metrics;
}
