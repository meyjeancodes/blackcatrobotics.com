// VDA 5050 — AGV/AMR fleet communication standard
import type { AdapterNormalizer, RobotState, RobotStateStatus } from "@/types/robot-state";

function mapOperatingMode(mode: string): RobotStateStatus {
  switch (mode) {
    case "AUTOMATIC": return "active";
    case "SEMIAUTOMATIC": return "active";
    case "MANUAL": return "idle";
    case "SERVICE": return "error";
    case "TEACHIN": return "idle";
    default: return "offline";
  }
}

export const vda5050Adapter: AdapterNormalizer = {
  vendor: "VDA 5050",
  adapter: "vda5050",
  normalize(raw): RobotState {
    const state = raw.state ?? raw;
    const pos = state.agvPosition ?? {};
    const charging = state.batteryState?.charging === true;
    const mode = state.operatingMode ?? "";
    return {
      robot_id: String(raw.serialNumber ?? raw.headerId ?? "vda-unknown"),
      vendor: raw.manufacturer ?? "VDA 5050",
      model: raw.agvClass ?? raw.model ?? "AGV",
      status: charging ? "charging" : mapOperatingMode(mode),
      battery_pct: Number(state.batteryState?.batteryCharge ?? 0),
      location: {
        x: Number(pos.x ?? 0),
        y: Number(pos.y ?? 0),
        zone: String(pos.mapId ?? "default"),
      },
      current_task: state.orderId ?? null,
      last_seen: raw.timestamp ?? new Date().toISOString(),
    };
  },
};
