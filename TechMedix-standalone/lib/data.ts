import {
  buildDashboardSnapshot,
  buildDashboardStats,
  defaultCustomerId,
  getRobotDetails,
  customers,
  type DashboardSnapshot,
  type Customer,
  type Robot,
  type Alert,
  type Job,
  type DiagnosticReport,
  type Technician,
  type TelemetryPoint
} from "@/lib/shared";
import { createClient } from "@/lib/supabase";

const useMockData =
  process.env.TECHMEDIX_USE_MOCK_DATA === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
const customerId = process.env.TECHMEDIX_DEFAULT_CUSTOMER_ID ?? defaultCustomerId;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function mapCustomer(r: Row): Customer {
  return {
    id: r.id,
    company: r.company,
    name: r.name,
    email: r.email,
    plan: r.plan,
    status: r.status,
    fleetSize: r.fleet_size ?? r.fleetSize,
    monthlySpend: r.monthly_spend ?? r.monthlySpend,
    createdAt: r.created_at ?? r.createdAt
  };
}

function mapRobot(r: Row): Robot {
  // telemetry_summary is a JSONB column seeded with initial values.
  // battery_level is the live-updated column from the simulation engine.
  const ts: Row = r.telemetry_summary ?? r.telemetrySummary ?? {};
  return {
    id: r.id,
    customerId: r.customer_id ?? r.customerId ?? "",
    name: r.name,
    platform: r.platform,
    serialNumber: r.serial_number ?? r.serialNumber ?? "",
    location: r.location,
    region: r.region ?? "",
    status: r.status,
    healthScore: r.health_score ?? r.healthScore ?? 0,
    lastSeenAt: r.last_updated ?? r.last_seen_at ?? r.lastSeenAt ?? new Date().toISOString(),
    telemetrySummary: {
      batteryPct: r.battery_level ?? ts.batteryPct ?? 100,
      motorTempC: ts.motorTempC ?? 70,
      jointWearPct: ts.jointWearPct ?? 0,
      firmwareVersion: ts.firmwareVersion ?? "unknown",
      anomalyCount: ts.anomalyCount ?? 0,
    },
    platformsSupported: r.platforms_supported ?? r.platformsSupported ?? []
  };
}

function mapAlert(r: Row): Alert {
  // Support both old schema (status column) and new schema (resolved boolean)
  const status: "active" | "resolved" =
    r.resolved === true ? "resolved" : (r.status ?? "active");
  return {
    id: r.id,
    customerId: r.customer_id ?? r.customerId ?? "",
    robotId: r.robot_id ?? r.robotId ?? "",
    title: r.title ?? r.message ?? "Alert",
    message: r.message,
    severity: r.severity,
    status,
    createdAt: r.created_at ?? r.createdAt,
    resolvedAt: r.resolved_at ?? r.resolvedAt
  };
}

function mapJob(r: Row): Job {
  return {
    id: r.id,
    customerId: r.customer_id ?? r.customerId ?? "",
    robotId: r.robot_id ?? r.robotId ?? "",
    description: r.description,
    status: r.status,
    technicianId: r.technician_id ?? r.technicianId,
    region: r.region ?? "",
    etaMinutes: r.eta_minutes ?? r.etaMinutes,
    createdAt: r.created_at ?? r.createdAt,
    updatedAt: r.updated_at ?? r.updatedAt
  };
}

function mapDiagnosticReport(r: Row): DiagnosticReport {
  return {
    id: r.id,
    robotId: r.robot_id ?? r.robotId,
    summary: r.summary,
    riskScore: r.risk_score ?? r.riskScore,
    recommendedProtocol: r.recommended_protocol ?? r.recommendedProtocol ?? [],
    findings: r.findings ?? [],
    rawOutput: r.raw_output ?? r.rawOutput,
    createdAt: r.created_at ?? r.createdAt
  };
}

function mapTechnician(r: Row): Technician {
  return {
    id: r.id,
    name: r.name,
    region: r.region,
    platforms: r.platforms ?? [],
    rating: r.rating,
    available: r.available,
    etaMinutes: r.eta_minutes ?? r.etaMinutes
  };
}

function mapTelemetryPoint(r: Row): TelemetryPoint {
  return {
    timestamp: r.timestamp,
    healthScore: r.health_score ?? r.healthScore,
    batteryPct: r.battery_pct ?? r.batteryPct,
    motorTempC: r.motor_temp_c ?? r.motorTempC,
    jointWearPct: r.joint_wear_pct ?? r.jointWearPct,
    anomalyCount: r.anomaly_count ?? r.anomalyCount
  };
}

export async function getDashboardData() {
  if (useMockData) {
    const snapshot = buildDashboardSnapshot(customerId);
    return {
      snapshot,
      stats: buildDashboardStats(snapshot)
    };
  }

  const supabase = createClient();

  const [customerRes, robotsRes, alertsRes, jobsRes, techniciansRes] = await Promise.all([
    supabase.from("customers").select("*").eq("id", customerId).single(),
    supabase.from("robots").select("*").eq("customer_id", customerId),
    supabase.from("alerts").select("*").eq("customer_id", customerId).eq("resolved", false),
    supabase.from("dispatch_jobs").select("*").eq("customer_id", customerId).neq("status", "completed").neq("status", "resolved"),
    supabase.from("technicians").select("*")
  ]);

  if (customerRes.error) throw new Error(customerRes.error.message);
  if (robotsRes.error) throw new Error(robotsRes.error.message);
  if (alertsRes.error) throw new Error(alertsRes.error.message);
  if (jobsRes.error) throw new Error(jobsRes.error.message);
  if (techniciansRes.error) throw new Error(techniciansRes.error.message);

  const robots = (robotsRes.data ?? []).map(mapRobot);
  const robotIds = robots.map((r) => r.id);

  const [diagnosticsRes, telemetryRes] = await Promise.all([
    robotIds.length > 0
      ? supabase.from("diagnostic_reports").select("*").in("robot_id", robotIds)
      : Promise.resolve({ data: [] as Row[], error: null }),
    robotIds.length > 0
      ? supabase.from("telemetry_snapshots").select("*").in("robot_id", robotIds).order("timestamp", { ascending: true })
      : Promise.resolve({ data: [] as Row[], error: null })
  ]);

  if (diagnosticsRes.error) throw new Error(diagnosticsRes.error.message);
  if (telemetryRes.error) throw new Error(telemetryRes.error.message);

  const telemetryHistory: DashboardSnapshot["telemetryHistory"] = {};
  for (const row of telemetryRes.data ?? []) {
    const rid = (row.robot_id ?? row.robotId) as string;
    if (!telemetryHistory[rid]) telemetryHistory[rid] = [];
    telemetryHistory[rid].push(mapTelemetryPoint(row));
  }

  const snapshot: DashboardSnapshot = {
    customer: mapCustomer(customerRes.data),
    robots,
    alerts: (alertsRes.data ?? []).map(mapAlert),
    jobs: (jobsRes.data ?? []).map(mapJob),
    diagnostics: (diagnosticsRes.data ?? []).map(mapDiagnosticReport),
    technicians: (techniciansRes.data ?? []).map(mapTechnician),
    telemetryHistory
  };

  return {
    snapshot,
    stats: buildDashboardStats(snapshot)
  };
}

export async function getRobotPageData(robotId: string) {
  if (useMockData) {
    return getRobotDetails(robotId, customerId);
  }

  const supabase = createClient();

  const [robotRes, alertsRes, jobsRes, diagnosticsRes, telemetryRes] = await Promise.all([
    supabase.from("robots").select("*").eq("id", robotId).single(),
    supabase.from("alerts").select("*").eq("robot_id", robotId),
    supabase.from("dispatch_jobs").select("*").eq("robot_id", robotId),
    supabase.from("diagnostic_reports").select("*").eq("robot_id", robotId),
    supabase.from("telemetry_snapshots").select("*").eq("robot_id", robotId).order("timestamp", { ascending: true })
  ]);

  if (robotRes.error) return null;
  if (alertsRes.error) throw new Error(alertsRes.error.message);
  if (jobsRes.error) throw new Error(jobsRes.error.message);
  if (diagnosticsRes.error) throw new Error(diagnosticsRes.error.message);
  if (telemetryRes.error) throw new Error(telemetryRes.error.message);

  return {
    robot: mapRobot(robotRes.data),
    alerts: (alertsRes.data ?? []).map(mapAlert),
    jobs: (jobsRes.data ?? []).map(mapJob),
    diagnostics: (diagnosticsRes.data ?? []).map(mapDiagnosticReport),
    telemetry: (telemetryRes.data ?? []).map(mapTelemetryPoint)
  };
}

export async function getAdminCustomers() {
  if (useMockData) {
    return customers;
  }

  const supabase = createClient();
  const { data, error } = await supabase.from("customers").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCustomer);
}
