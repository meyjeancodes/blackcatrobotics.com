/**
 * DJI Drone Fleet Types for TechMedix
 * Used across API routes, components, and the dji-care-coverage engine.
 * These types correspond to Supabase tables:
 *   dji_drones, drone_flight_logs, drone_diagnostic_reports, drone_care_refresh_claims
 *
 * TODO: Run the SQL migration at lib/dji-care-coverage.ts bottom comment before first use.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type CareRefreshPlan = "NONE" | "ONE_YEAR" | "TWO_YEAR" | "COMBO";

export type PropellerCondition = "GOOD" | "WORN" | "REPLACE";

export type RecommendedAction = "MONITOR" | "SERVICE" | "CLAIM" | "GROUND";

export type DamageType = "COLLISION" | "WATER" | "FLYAWAY" | "SIGNAL_LOSS" | "OTHER";

export type ClaimStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REPLACEMENT_SHIPPED"
  | "CLOSED"
  | "DENIED";

export type DiagnosticAlertSeverity = "P1" | "P2" | "P3";

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface DjiDrone {
  id: string;
  serial_number: string;
  model: string;
  purchase_date: string; // ISO date string
  care_refresh_plan: CareRefreshPlan;
  care_refresh_activated_at: string | null; // ISO datetime
  care_refresh_expires_at: string | null;   // ISO datetime
  replacements_used: number;
  replacements_remaining: number;
  fleet_id: string | null;
  created_at: string;
  updated_at: string;
  // UI-computed fields (returned by fleet-health endpoint)
  latest_health_score?: number;
  active_alerts_count?: number;
  last_flight_date?: string | null;
}

export interface DroneFlightLog {
  id: string;
  drone_id: string;
  flight_date: string;     // ISO datetime
  duration_minutes: number;
  max_altitude_m: number;
  max_speed_ms: number;
  distance_km: number;
  battery_start_pct: number;
  battery_end_pct: number;
  signal_quality_avg: number; // 0-100
  incidents: FlightIncident[];
  raw_log_path: string | null;
  created_at: string;
}

export interface FlightIncident {
  timestamp_s: number;
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface DroneMotorHealth {
  score: number;
  rpm_variance: number;
  vibration_level: number;
}

export interface DroneDiagnosticReport {
  id: string;
  drone_id: string;
  generated_at: string;
  overall_health_score: number; // 0-100
  battery_health_score: number;
  motor_health_score: {
    motor_1: DroneMotorHealth;
    motor_2: DroneMotorHealth;
    motor_3: DroneMotorHealth;
    motor_4: DroneMotorHealth;
  };
  gimbal_health_score: number;
  signal_health_score: number;
  propeller_condition: PropellerCondition;
  techmedix_alerts: DiagnosticAlert[];
  care_refresh_eligible: boolean;
  recommended_action: RecommendedAction;
  report_data: DroneReportData;
}

export interface DiagnosticAlert {
  severity: DiagnosticAlertSeverity;
  signal: string;
  message: string;
  action: string;
}

export interface DroneReportData {
  battery_health: {
    score: number;
    trend: "improving" | "stable" | "degrading";
    cycle_count?: number;
    estimated_remaining_cycles?: number;
  };
  motor_health: {
    motor_1: DroneMotorHealth;
    motor_2: DroneMotorHealth;
    motor_3: DroneMotorHealth;
    motor_4: DroneMotorHealth;
  };
  gimbal_health: {
    score: number;
    drift_detected: boolean;
    calibration_needed: boolean;
  };
  signal_health: {
    score: number;
    avg_rssi: number;
    packet_loss_pct: number;
  };
  care_refresh_recommendation: {
    should_claim: boolean;
    damage_type: string;
    reasoning: string;
  };
  maintenance_items: MaintenanceItem[];
  alerts: DiagnosticAlert[];
  propeller_condition: PropellerCondition;
  overall_health_score: number;
  recommended_action: RecommendedAction;
}

export interface MaintenanceItem {
  item: string;
  priority: "high" | "medium" | "low";
  estimated_cost: string;
}

export interface DroneCareRefreshClaim {
  id: string;
  drone_id: string;
  claim_date: string;
  damage_type: DamageType;
  damage_description: string;
  flight_log_id: string | null;
  photos_uploaded: string[];
  claim_status: ClaimStatus;
  replacement_serial: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface RegisterDroneBody {
  serial_number: string;
  model: string;
  purchase_date: string;
  care_refresh_plan: CareRefreshPlan;
  care_refresh_activated_at?: string;
  fleet_id?: string;
}

export interface DiagnoseBody {
  flight_logs?: Partial<DroneFlightLog>[];
  manual_inputs?: Record<string, unknown>;
}

export interface InitiateClaimBody {
  damage_type: DamageType;
  description: string;
  flight_log_id?: string;
  care_refresh_plan_check: boolean;
}

export interface FlightLogUploadBody {
  raw_log: string;
  source: "dji_assistant" | "manual";
}

export interface FleetHealthResponse {
  total_drones: number;
  active_care_refresh: number;
  expiring_soon: DjiDrone[];
  health_distribution: {
    excellent: number; // >80
    good: number;      // 60-80
    fair: number;      // 40-60
    poor: number;      // <40
  };
  open_claims: number;
  drones_requiring_attention: DjiDrone[];
  fleet_health_score: number;
  replacement_units_used_this_period: number;
}
