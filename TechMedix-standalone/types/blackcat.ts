// TechMedix / BlackCat OS — canonical types matching the Supabase schema.
// Import these throughout the backend. Do not define inline types elsewhere.

export type RobotStatus = "online" | "idle" | "warning" | "service" | "offline";
export type AlertSeverity = "critical" | "warning" | "info";
export type JobStatus =
  | "open"
  | "assigned"
  | "en_route"
  | "in_service"
  | "onsite"
  | "resolved"
  | "completed";
export type TaskType = "charge" | "inspect" | "repair" | "calibrate";
export type TaskStatus = "pending" | "active" | "completed";

export interface BlackCatRobot {
  id: string;
  customer_id: string | null;
  name: string;
  platform: string;
  serial_number: string | null;
  location: string;
  region: string | null;
  battery_level: number;
  health_score: number;
  status: RobotStatus;
  telemetry_summary: Record<string, unknown>;
  platforms_supported: string[];
  last_seen_at: string;
  last_updated: string;
}

export interface BlackCatAlert {
  id: string;
  customer_id: string | null;
  robot_id: string | null;
  title: string | null;
  message: string;
  severity: AlertSeverity;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export interface DispatchJob {
  id: string;
  customer_id: string | null;
  robot_id: string | null;
  technician_id: string | null;
  technician_name: string | null;
  description: string;
  status: JobStatus;
  region: string | null;
  eta_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface EnergyState {
  id: string;
  robot_id: string;
  battery_level: number;
  consumption_rate: number | null;
  solar_kwh: number;
  updated_at: string;
}

export interface EnergyTransaction {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  kwh: number;
  price_per_kwh: number;
  total_price: number;
  created_at: string;
}

export interface Task {
  id: string;
  robot_id: string;
  type: TaskType;
  priority: number;
  status: TaskStatus;
  created_at: string;
}

export interface GridStateResponse {
  supply: EnergyState[];
  demand: EnergyState[];
  transactions: EnergyTransaction[];
  totals: {
    supply_kwh: number;
    demand_kwh: number;
    transaction_count: number;
    total_traded_kwh: number;
  };
}
