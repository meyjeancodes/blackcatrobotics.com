export type CustomerPlan = "operator" | "fleet" | "command";
export type CustomerStatus = "active" | "trial" | "inactive";
export type AppRole =
  | "customer_admin"
  | "customer_operator"
  | "technician"
  | "blackcat_admin";
export type RobotStatus = "online" | "warning" | "service" | "offline";
export type AlertSeverity = "info" | "warning" | "critical";
export type JobStatus =
  | "open"
  | "assigned"
  | "en_route"
  | "onsite"
  | "resolved";

export interface Customer {
  id: string;
  company: string;
  name: string;
  email: string;
  plan: CustomerPlan;
  status: CustomerStatus;
  fleetSize: number;
  monthlySpend: number;
  createdAt: string;
}

export interface TelemetryPoint {
  timestamp: string;
  healthScore: number;
  batteryPct: number;
  motorTempC: number;
  jointWearPct: number;
  anomalyCount: number;
}

export interface RobotTelemetrySummary {
  batteryPct: number;
  motorTempC: number;
  jointWearPct: number;
  firmwareVersion: string;
  anomalyCount: number;
}

export interface Robot {
  id: string;
  customerId: string;
  name: string;
  platform: string;
  serialNumber: string;
  location: string;
  region: string;
  status: RobotStatus;
  healthScore: number;
  lastSeenAt: string;
  telemetrySummary: RobotTelemetrySummary;
  platformsSupported: string[];
}

export interface DiagnosticFinding {
  title: string;
  evidence: string;
  recommendedAction: string;
}

export interface DiagnosticReport {
  id: string;
  robotId: string;
  summary: string;
  riskScore: number;
  recommendedProtocol: string[];
  findings: DiagnosticFinding[];
  rawOutput: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  customerId: string;
  robotId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: "active" | "resolved";
  createdAt: string;
  resolvedAt?: string;
}

export interface Technician {
  id: string;
  name: string;
  region: string;
  platforms: string[];
  rating: number;
  available: boolean;
  etaMinutes: number;
}

export interface Job {
  id: string;
  customerId: string;
  robotId: string;
  description: string;
  status: JobStatus;
  technicianId?: string;
  region: string;
  etaMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppSession {
  userId: string;
  customerId: string;
  role: AppRole;
  email: string;
  name: string;
}

export interface DashboardSnapshot {
  customer: Customer;
  robots: Robot[];
  alerts: Alert[];
  jobs: Job[];
  diagnostics: DiagnosticReport[];
  technicians: Technician[];
  telemetryHistory: Record<string, TelemetryPoint[]>;
}

export interface DashboardStats {
  fleetHealthAverage: number;
  criticalAlerts: number;
  openJobs: number;
  activeRobots: number;
}

// ── SYSTEM NODE MODEL ──────────────────────────────────────────────────────────

export type NodeType = "robot" | "home" | "ev" | "charger" | "sensor" | "gateway";
export type NodeStatus = "online" | "offline" | "warning" | "maintenance" | "idle";
export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "deferred";
export type MaintenancePriority = "low" | "medium" | "high" | "critical";
export type WorkOrderStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
export type AccessRole = "admin" | "technician" | "viewer";

export interface SystemNode {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  last_seen: string;
  metadata: Record<string, string | number | boolean>;
}

export interface NodeEvent {
  id: string;
  node_id: string;
  event_type: string;
  severity: AlertSeverity;
  timestamp: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ImpactLevel = "minimal" | "moderate" | "significant" | "severe";

export interface MaintenanceEvent {
  id: string;
  node_id: string;
  issue: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  created_at: string;
  resolved_at?: string;
  risk_level?: RiskLevel;
  estimated_downtime_hours?: number;
  impact_level?: ImpactLevel;
}

export interface SignalEntry {
  id: string;
  source: string;
  time: string;
  title: string;
  summary: string;
  tags: string[];
  category: "robotics" | "ai" | "ev_energy" | "smart_cities" | "construction_tech";
}

export interface WorkOrder {
  id: string;
  maintenance_id: string;
  technician_id?: string;
  status: WorkOrderStatus;
  scheduled_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: AccessRole;
  timestamp: string;
  resource?: string;
  detail?: string;
}

// ── BILLING PREP ───────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  customer_id: string;
  product: "habitat" | "techmedix" | "enterprise";
  tier: string;
  status: "active" | "trial" | "cancelled";
  started_at: string;
  renewed_at?: string;
}

export interface NodeUsage {
  id: string;
  subscription_id: string;
  node_id: string;
  period_start: string;
  period_end: string;
  hours_active: number;
}

export interface BillingEvent {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  created_at: string;
}
