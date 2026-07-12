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

  // ── Fleet observability KPIs (DALE proof point) ──────────────────────────────
  // Optional so legacy adapters keep working; populated when the vendor reports it.
  task_count?: number; // cumulative tasks completed (e.g. holes drilled)
  task_accuracy_pct?: number; // 0–100, QA pass rate
  cycle_state?: string; // drilling | charging | dumping | idle
  schedule_impact_hours?: number; // net hours saved vs manual baseline

  // ── Outcome-linked metrics (Lely proof point) ───────────────────────────────
  // Vendor-specific business KPIs the robot is meant to move (e.g. milk_yield_delta).
  outcome_metrics_json?: Record<string, number>;
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
