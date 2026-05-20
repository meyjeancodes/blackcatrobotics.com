import type { AdapterNormalizer, RobotState } from "@/types/robot-state";

export const genericRestAdapter: AdapterNormalizer = {
  vendor: "Generic REST",
  adapter: "generic_rest",
  normalize(raw): RobotState {
    return {
      robot_id: String(raw.robot_id ?? raw.id ?? "unknown"),
      vendor: raw.vendor ?? "Generic",
      model: raw.model ?? raw.platform ?? "Unknown",
      status: raw.status ?? "offline",
      battery_pct: Number(raw.battery_pct ?? raw.battery_level ?? 0),
      location: {
        x: Number(raw.location?.x ?? raw.x ?? 0),
        y: Number(raw.location?.y ?? raw.y ?? 0),
        zone: String(raw.location?.zone ?? raw.zone ?? "Unknown"),
      },
      current_task: raw.current_task ?? null,
      last_seen: raw.last_seen ?? raw.last_updated ?? new Date().toISOString(),
    };
  },
};
