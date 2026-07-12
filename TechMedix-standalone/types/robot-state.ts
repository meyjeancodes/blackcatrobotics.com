// Canonical cross-vendor robot state — all vendor adapters normalize to this shape.
export type VendorAdapter = "generic_rest" | "vda5050" | "openrmf" | "ros2_bridge";

export type RobotStateStatus = "active" | "idle" | "charging" | "error" | "offline";

export interface RobotState {
  robot_id: string;
  vendor: string;
  model: string;
  status: RobotStateStatus;
  battery_pct: number;
  location: { x: number; y: number; zone: string };
  current_task: string | null;
  last_seen: string; // ISO 8601
}

export interface VendorConnection {
  id: string;
  vendor: string;
  adapter: VendorAdapter;
  endpoint: string;
  label: string;
  healthy: boolean;
  last_checked: string;
}

export interface AdapterNormalizer {
  vendor: string;
  adapter: VendorAdapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  normalize(raw: any): RobotState;
}
