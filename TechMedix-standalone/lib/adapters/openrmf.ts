// Open-RMF — multi-vendor robot fleet management framework
import type { AdapterNormalizer, RobotState, RobotStateStatus } from "@/types/robot-state";

function mapRmfMode(mode: number): RobotStateStatus {
  // Open-RMF RobotMode enum
  switch (mode) {
    case 0: return "idle";
    case 1: return "charging";
    case 2: return "active";   // MOVING
    case 3: return "active";   // PAUSING
    case 4: return "error";    // WAITING
    case 5: return "error";    // EMERGENCY
    case 6: return "error";    // GOING_HOME
    default: return "offline";
  }
}

export const openrmfAdapter: AdapterNormalizer = {
  vendor: "Open-RMF",
  adapter: "openrmf",
  normalize(raw): RobotState {
    const loc = raw.location ?? {};
    return {
      robot_id: String(raw.name ?? raw.robot_name ?? "rmf-unknown"),
      vendor: raw.fleet_name ?? "Open-RMF",
      model: raw.model ?? "RMF Robot",
      status: mapRmfMode(raw.mode?.mode ?? -1),
      battery_pct: Number((raw.battery_percent ?? 0) * 100),
      location: {
        x: Number(loc.x ?? 0),
        y: Number(loc.y ?? 0),
        zone: String(loc.level_name ?? loc.map ?? "Unknown"),
      },
      current_task: raw.task_id ?? null,
      last_seen: raw.location?.t?.sec
        ? new Date(raw.location.t.sec * 1000).toISOString()
        : new Date().toISOString(),
    };
  },
};
