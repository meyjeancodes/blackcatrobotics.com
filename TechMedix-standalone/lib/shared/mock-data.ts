import type {
  Alert,
  AuditLog,
  Customer,
  DashboardSnapshot,
  DashboardStats,
  DiagnosticReport,
  Job,
  MaintenanceEvent,
  NodeEvent,
  Robot,
  SignalEntry,
  SystemNode,
  Technician,
  TelemetryPoint,
  WorkOrder
} from "./types";

export const customers: Customer[] = [
  {
    id: "cus_acme_robotics",
    company: "Demo Fleet",
    name: "Megan Foster",
    email: "megan@blackcatrobotics.com",
    plan: "fleet",
    status: "active",
    fleetSize: 4,
    monthlySpend: 916,
    createdAt: "2026-03-01T14:00:00.000Z"
  },
  {
    id: "cus_summit_logistics",
    company: "Summit Logistics",
    name: "Daniel Kline",
    email: "daniel@summitlogistics.com",
    plan: "operator",
    status: "trial",
    fleetSize: 2,
    monthlySpend: 598,
    createdAt: "2026-03-10T18:30:00.000Z"
  }
];

export const robots: Robot[] = [
  {
    id: "robot_atlas_7f4a",
    customerId: "cus_acme_robotics",
    name: "Robot-001 (sample)",
    platform: "Boston Dynamics Atlas Gen 2",
    serialNumber: "ATL-7F4A-0021",
    location: "Automotive Plant (sample)",
    region: "Southeast",
    status: "warning",
    healthScore: 68,
    lastSeenAt: "2026-03-19T09:15:00.000Z",
    telemetrySummary: {
      batteryPct: 81,
      motorTempC: 88,
      jointWearPct: 61,
      firmwareVersion: "atlas-os 5.4.2",
      anomalyCount: 3
    },
    platformsSupported: [
      "Boston Dynamics Atlas Gen 2"
    ]
  },
  {
    id: "robot_unitree_g1_11",
    customerId: "cus_acme_robotics",
    name: "Unitree-G1-11",
    platform: "Unitree G1 EDU",
    serialNumber: "G1-EDU-1049",
    location: "Test Lab (sample)",
    region: "Texas",
    status: "online",
    healthScore: 92,
    lastSeenAt: "2026-03-19T09:13:00.000Z",
    telemetrySummary: {
      batteryPct: 76,
      motorTempC: 59,
      jointWearPct: 21,
      firmwareVersion: "g1-core 3.8.1",
      anomalyCount: 0
    },
    platformsSupported: [
      "Unitree G1 EDU",
      "Unitree H1-2"
    ]
  },
  {
    id: "robot_dji_t50_03",
    customerId: "cus_acme_robotics",
    name: "Agras-T50-03",
    platform: "DJI Agras T50",
    serialNumber: "T50-AG-3308",
    location: "Farm Grid (sample)",
    region: "Texas",
    status: "service",
    healthScore: 44,
    lastSeenAt: "2026-03-19T08:58:00.000Z",
    telemetrySummary: {
      batteryPct: 39,
      motorTempC: 95,
      jointWearPct: 72,
      firmwareVersion: "agras 8.2.0",
      anomalyCount: 7
    },
    platformsSupported: [
      "DJI Agras T50"
    ]
  },
  {
    id: "robot_figure_02_09",
    customerId: "cus_acme_robotics",
    name: "Figure-02-09",
    platform: "Figure 02",
    serialNumber: "FIG-02-9007",
    location: "Manufacturing Cell (sample)",
    region: "Southeast",
    status: "online",
    healthScore: 87,
    lastSeenAt: "2026-03-19T09:11:00.000Z",
    telemetrySummary: {
      batteryPct: 68,
      motorTempC: 64,
      jointWearPct: 29,
      firmwareVersion: "figure-runtime 2.1.7",
      anomalyCount: 1
    },
    platformsSupported: [
      "Figure 02"
    ]
  }
];

export const alerts: Alert[] = [
  {
    id: "alert_001",
    customerId: "cus_acme_robotics",
    robotId: "robot_dji_t50_03",
    title: "Impeller vibration spike",
    message: "Telemetry shows sustained motor heat and a sudden vibration jump on the right spray arm.",
    severity: "critical",
    status: "active",
    createdAt: "2026-03-19T08:59:00.000Z"
  },
  {
    id: "alert_002",
    customerId: "cus_acme_robotics",
    robotId: "robot_atlas_7f4a",
    title: "Knee actuator drift",
    message: "Left knee torque variance exceeded baseline for the third time in 24 hours.",
    severity: "warning",
    status: "active",
    createdAt: "2026-03-19T09:16:00.000Z"
  },
  {
    id: "alert_003",
    customerId: "cus_acme_robotics",
    robotId: "robot_figure_02_09",
    title: "Calibration reminder",
    message: "Quarterly calibration window opens in 3 days.",
    severity: "info",
    status: "active",
    createdAt: "2026-03-18T17:10:00.000Z"
  }
];

export const jobs: Job[] = [
  {
    id: "job_001",
    customerId: "cus_acme_robotics",
    robotId: "robot_dji_t50_03",
    description: "Inspect spray arm, replace impeller, and verify thermal envelope.",
    status: "assigned",
    technicianId: "tech_003",
    region: "Texas",
    etaMinutes: 74,
    createdAt: "2026-03-19T09:05:00.000Z",
    updatedAt: "2026-03-19T09:12:00.000Z"
  },
  {
    id: "job_002",
    customerId: "cus_acme_robotics",
    robotId: "robot_atlas_7f4a",
    description: "Review left knee actuator wear and run gait recalibration.",
    status: "open",
    region: "Southeast",
    createdAt: "2026-03-19T09:18:00.000Z",
    updatedAt: "2026-03-19T09:18:00.000Z"
  }
];

export const technicians: Technician[] = [
  {
    id: "tech_001",
    name: "Lena Ortiz",
    region: "Southeast",
    platforms: [
      "Boston Dynamics Atlas Gen 2",
      "Figure 02"
    ],
    rating: 4.9,
    available: true,
    etaMinutes: 112
  },
  {
    id: "tech_002",
    name: "Marcus Bell",
    region: "Southeast",
    platforms: [
      "Boston Dynamics Atlas Gen 2",
      "Unitree G1 EDU"
    ],
    rating: 4.7,
    available: false,
    etaMinutes: 180
  },
  {
    id: "tech_003",
    name: "Demo Technician",
    region: "Texas",
    platforms: [
      "DJI Agras T50",
      "Unitree G1 EDU"
    ],
    rating: 4.8,
    available: true,
    etaMinutes: 74
  }
];

export const diagnostics: DiagnosticReport[] = [
  {
    id: "diag_001",
    robotId: "robot_dji_t50_03",
    summary: "Impeller-side heat and vibration suggest a near-term failure risk on the right spray assembly.",
    riskScore: 86,
    recommendedProtocol: [
      "Ground the aircraft and swap the right spray arm impeller.",
      "Inspect motor housing for debris ingress and re-run balance calibration.",
      "Monitor two post-service flights before returning to production."
    ],
    findings: [
      {
        title: "Thermal rise above operating envelope",
        evidence: "Motor temperature peaked at 95 C with repeated spikes over the last 6 hours.",
        recommendedAction: "Inspect motor bearings and confirm airflow path is clear."
      },
      {
        title: "Vibration variance increased sharply",
        evidence: "Anomaly count rose to 7 and spray-arm vibration signatures diverged from baseline.",
        recommendedAction: "Replace the right spray arm impeller before next mission."
      }
    ],
    rawOutput: "{\"summary\":\"Impeller-side heat and vibration suggest a near-term failure risk on the right spray assembly.\",\"riskScore\":86}",
    createdAt: "2026-03-19T09:03:00.000Z"
  },
  {
    id: "diag_002",
    robotId: "robot_atlas_7f4a",
    summary: "Left knee actuator drift is rising, but the robot can continue limited duty if load is reduced.",
    riskScore: 63,
    recommendedProtocol: [
      "Reduce lift-heavy tasks until recalibration is completed.",
      "Schedule a technician visit within 12 hours.",
      "Capture an additional gait trace after the next shift."
    ],
    findings: [
      {
        title: "Torque variance exceeded learned baseline",
        evidence: "Knee actuator drift repeated three times in 24 hours while operating under full load.",
        recommendedAction: "Run gait recalibration and inspect actuator mounting points."
      }
    ],
    rawOutput: "{\"summary\":\"Left knee actuator drift is rising.\",\"riskScore\":63}",
    createdAt: "2026-03-19T09:17:00.000Z"
  }
];

export const telemetryHistory: Record<string, TelemetryPoint[]> = {
  robot_atlas_7f4a: [
    { timestamp: "2026-03-19T03:00:00.000Z", healthScore: 79, batteryPct: 92, motorTempC: 73, jointWearPct: 58, anomalyCount: 1 },
    { timestamp: "2026-03-19T05:00:00.000Z", healthScore: 76, batteryPct: 89, motorTempC: 77, jointWearPct: 59, anomalyCount: 1 },
    { timestamp: "2026-03-19T07:00:00.000Z", healthScore: 72, batteryPct: 86, motorTempC: 81, jointWearPct: 60, anomalyCount: 2 },
    { timestamp: "2026-03-19T09:00:00.000Z", healthScore: 68, batteryPct: 81, motorTempC: 88, jointWearPct: 61, anomalyCount: 3 }
  ],
  robot_unitree_g1_11: [
    { timestamp: "2026-03-19T03:00:00.000Z", healthScore: 91, batteryPct: 82, motorTempC: 55, jointWearPct: 20, anomalyCount: 0 },
    { timestamp: "2026-03-19T05:00:00.000Z", healthScore: 93, batteryPct: 80, motorTempC: 57, jointWearPct: 20, anomalyCount: 0 },
    { timestamp: "2026-03-19T07:00:00.000Z", healthScore: 92, batteryPct: 78, motorTempC: 58, jointWearPct: 21, anomalyCount: 0 },
    { timestamp: "2026-03-19T09:00:00.000Z", healthScore: 92, batteryPct: 76, motorTempC: 59, jointWearPct: 21, anomalyCount: 0 }
  ],
  robot_dji_t50_03: [
    { timestamp: "2026-03-19T03:00:00.000Z", healthScore: 58, batteryPct: 55, motorTempC: 79, jointWearPct: 63, anomalyCount: 3 },
    { timestamp: "2026-03-19T05:00:00.000Z", healthScore: 55, batteryPct: 49, motorTempC: 83, jointWearPct: 66, anomalyCount: 4 },
    { timestamp: "2026-03-19T07:00:00.000Z", healthScore: 49, batteryPct: 44, motorTempC: 89, jointWearPct: 69, anomalyCount: 6 },
    { timestamp: "2026-03-19T09:00:00.000Z", healthScore: 44, batteryPct: 39, motorTempC: 95, jointWearPct: 72, anomalyCount: 7 }
  ],
  robot_figure_02_09: [
    { timestamp: "2026-03-19T03:00:00.000Z", healthScore: 84, batteryPct: 78, motorTempC: 60, jointWearPct: 27, anomalyCount: 1 },
    { timestamp: "2026-03-19T05:00:00.000Z", healthScore: 86, batteryPct: 75, motorTempC: 62, jointWearPct: 28, anomalyCount: 1 },
    { timestamp: "2026-03-19T07:00:00.000Z", healthScore: 88, batteryPct: 71, motorTempC: 63, jointWearPct: 29, anomalyCount: 1 },
    { timestamp: "2026-03-19T09:00:00.000Z", healthScore: 87, batteryPct: 68, motorTempC: 64, jointWearPct: 29, anomalyCount: 1 }
  ]
};

export const defaultCustomerId = "cus_acme_robotics";

export function buildDashboardSnapshot(
  customerId = defaultCustomerId
): DashboardSnapshot {
  const customer = customers.find((entry) => entry.id === customerId) ?? customers[0];
  return {
    customer,
    robots: robots.filter((robot) => robot.customerId === customer.id),
    alerts: alerts.filter((alert) => alert.customerId === customer.id),
    jobs: jobs.filter((job) => job.customerId === customer.id),
    diagnostics: diagnostics.filter((report) =>
      robots.some(
        (robot) => robot.customerId === customer.id && robot.id === report.robotId
      )
    ),
    technicians,
    telemetryHistory
  };
}

export function buildDashboardStats(snapshot: DashboardSnapshot): DashboardStats {
  const fleetHealthAverage =
    snapshot.robots.reduce((sum, robot) => sum + robot.healthScore, 0) /
    Math.max(snapshot.robots.length, 1);

  return {
    fleetHealthAverage: Math.round(fleetHealthAverage),
    criticalAlerts: snapshot.alerts.filter(
      (alert) => alert.status === "active" && alert.severity === "critical"
    ).length,
    openJobs: snapshot.jobs.filter((job) => job.status !== "resolved").length,
    activeRobots: snapshot.robots.filter((robot) => robot.status !== "offline").length
  };
}

export function getRobotDetails(
  robotId: string,
  customerId = defaultCustomerId
) {
  const snapshot = buildDashboardSnapshot(customerId);
  const robot = snapshot.robots.find((entry) => entry.id === robotId);

  if (!robot) {
    return null;
  }

  return {
    robot,
    alerts: snapshot.alerts.filter((alert) => alert.robotId === robotId),
    jobs: snapshot.jobs.filter((job) => job.robotId === robotId),
    diagnostics: snapshot.diagnostics.filter((report) => report.robotId === robotId),
    telemetry: snapshot.telemetryHistory[robotId] ?? []
  };
}

// ── SYSTEM NODE MOCK DATA ──────────────────────────────────────────────────────

export const systemNodes: SystemNode[] = [
  { id: "node_atlas_7f4a", name: "Robot-001 (sample)", type: "robot", status: "warning", last_seen: "2026-03-19T09:15:00.000Z", metadata: { location: "Automotive Plant (sample)", platform: "Boston Dynamics Atlas Gen 2", health: 68 } },
  { id: "node_unitree_g1", name: "Unitree-G1-11", type: "robot", status: "online", last_seen: "2026-03-19T09:13:00.000Z", metadata: { location: "Test Lab (sample)", platform: "Unitree G1 EDU", health: 92 } },
  { id: "node_dji_t50", name: "Agras-T50-03", type: "robot", status: "maintenance", last_seen: "2026-03-19T08:58:00.000Z", metadata: { location: "Farm Grid (sample)", platform: "DJI Agras T50", health: 44 } },
  { id: "node_figure_02", name: "Figure-02-09", type: "robot", status: "online", last_seen: "2026-03-19T09:11:00.000Z", metadata: { location: "Manufacturing Cell (sample)", platform: "Figure 02", health: 87 } },
  { id: "node_habitat_tx01", name: "HABITAT-TX-01", type: "home", status: "online", last_seen: "2026-03-19T09:00:00.000Z", metadata: { address: "Cumby, TX", sqft: 1240, solar_kwh: 18.4 } },
  { id: "node_habitat_101", name: "HABITAT Unit #101", type: "home", status: "online", last_seen: "2026-03-19T09:05:00.000Z", metadata: { address: "Cumby, TX — Lot 101", sqft: 1240, solar_kwh: 18.4, build_status: "occupied" } },
  { id: "node_habitat_202", name: "HABITAT Unit #202", type: "home", status: "warning", last_seen: "2026-03-19T08:50:00.000Z", metadata: { address: "Cumby, TX — Lot 202", sqft: 980, solar_kwh: 14.2, build_status: "commissioning" } },
  { id: "node_ev_tesla_01", name: "Tesla Model Y — Fleet-01", type: "ev", status: "idle", last_seen: "2026-03-19T08:45:00.000Z", metadata: { battery_pct: 82, range_mi: 248, location: "Austin HQ" } },
  { id: "node_charger_01", name: "DC Fast Charger — Bay 1", type: "charger", status: "online", last_seen: "2026-03-19T09:15:00.000Z", metadata: { power_kw: 150, sessions_today: 7 } },
];

export const nodeEvents: NodeEvent[] = [
  { id: "evt_001", node_id: "node_dji_t50", event_type: "thermal_spike", severity: "critical", timestamp: "2026-03-19T08:59:00.000Z" },
  { id: "evt_002", node_id: "node_atlas_7f4a", event_type: "actuator_drift", severity: "warning", timestamp: "2026-03-19T09:16:00.000Z" },
  { id: "evt_003", node_id: "node_figure_02", event_type: "calibration_due", severity: "info", timestamp: "2026-03-18T17:10:00.000Z" },
  { id: "evt_004", node_id: "node_charger_01", event_type: "session_start", severity: "info", timestamp: "2026-03-19T09:01:00.000Z" },
  { id: "evt_005", node_id: "node_habitat_101", event_type: "solar_export", severity: "info", timestamp: "2026-03-19T08:00:00.000Z" },
  { id: "evt_006", node_id: "node_habitat_202", event_type: "commissioning_check", severity: "warning", timestamp: "2026-03-19T08:50:00.000Z" },
];

export const maintenanceEvents: MaintenanceEvent[] = [
  { id: "maint_001", node_id: "node_dji_t50", issue: "Impeller vibration spike — right spray arm thermal failure risk", status: "in_progress", priority: "critical", created_at: "2026-03-19T09:00:00.000Z", risk_level: "CRITICAL", estimated_downtime_hours: 6, impact_level: "severe" },
  { id: "maint_002", node_id: "node_atlas_7f4a", issue: "Left knee actuator drift — gait recalibration required", status: "open", priority: "high", created_at: "2026-03-19T09:18:00.000Z", risk_level: "HIGH", estimated_downtime_hours: 2, impact_level: "significant" },
  { id: "maint_003", node_id: "node_figure_02", issue: "Quarterly calibration window opens in 3 days", status: "open", priority: "low", created_at: "2026-03-18T17:10:00.000Z", risk_level: "LOW", estimated_downtime_hours: 0.5, impact_level: "minimal" },
  { id: "maint_004", node_id: "node_habitat_tx01", issue: "Solar inverter firmware update available", status: "deferred", priority: "medium", created_at: "2026-03-17T10:00:00.000Z", risk_level: "MEDIUM", estimated_downtime_hours: 1, impact_level: "moderate" },
  { id: "maint_005", node_id: "node_habitat_202", issue: "Commissioning check incomplete — moisture sensor offline", status: "open", priority: "medium", created_at: "2026-03-19T08:50:00.000Z", risk_level: "MEDIUM", estimated_downtime_hours: 1.5, impact_level: "moderate" },
];

export const workOrders: WorkOrder[] = [
  { id: "wo_001", maintenance_id: "maint_001", technician_id: "tech_003", status: "in_progress", scheduled_at: "2026-03-19T10:30:00.000Z", notes: "Inspect spray arm, replace impeller, verify thermal envelope" },
  { id: "wo_002", maintenance_id: "maint_002", status: "pending", scheduled_at: "2026-03-19T14:00:00.000Z", notes: "Review left knee actuator wear and run gait recalibration" },
  { id: "wo_003", maintenance_id: "maint_003", technician_id: "tech_001", status: "assigned", scheduled_at: "2026-03-22T09:00:00.000Z" },
];

export const auditLogs: AuditLog[] = [
  { id: "log_001", action: "work_order_created", user: "megan@blackcatrobotics.com", role: "admin", timestamp: "2026-03-19T09:05:00.000Z", resource: "wo_001", detail: "Created work order for DJI Agras T50 impeller repair" },
  { id: "log_002", action: "technician_assigned", user: "megan@blackcatrobotics.com", role: "admin", timestamp: "2026-03-19T09:12:00.000Z", resource: "wo_001", detail: "Assigned Demo Technician to work order wo_001" },
  { id: "log_003", action: "node_status_updated", user: "system", role: "admin", timestamp: "2026-03-19T08:59:00.000Z", resource: "node_dji_t50", detail: "Node status changed from online to maintenance" },
  { id: "log_004", action: "alert_acknowledged", user: "megan@blackcatrobotics.com", role: "admin", timestamp: "2026-03-19T09:20:00.000Z", resource: "alert_002", detail: "Atlas knee actuator alert acknowledged" },
  { id: "log_005", action: "login", user: "priya@blackcatrobotics.com", role: "technician", timestamp: "2026-03-19T09:00:00.000Z", detail: "Technician portal login" },
  { id: "log_006", action: "work_order_updated", user: "priya@blackcatrobotics.com", role: "technician", timestamp: "2026-03-19T10:35:00.000Z", resource: "wo_001", detail: "Status updated to in_progress" },
];

// ── SERVICE NETWORK SIMULATION DATA ──────────────────────────────────────────

export type ServiceEventSeverity = "info" | "warning" | "success";

export interface ServiceEventTemplate {
  message: string;
  severity: ServiceEventSeverity;
}

export const serviceEventTemplates: ServiceEventTemplate[] = [
  { message: "Technician dispatched to HABITAT Unit #202", severity: "info" },
  { message: "Replacement part ordered — impeller assembly", severity: "info" },
  { message: "Technician en route to Automotive Plant (sample)", severity: "info" },
  { message: "Service completed successfully — Robot-001 (sample)", severity: "success" },
  { message: "Part ordered — left knee actuator module", severity: "info" },
  { message: "Technician assigned to work order WO-0041", severity: "info" },
  { message: "Route optimized — ETA reduced by 18 min", severity: "success" },
  { message: "Maintenance completed — Agras-T50-03 cleared", severity: "success" },
  { message: "Technician dispatched to Test Lab (sample)", severity: "info" },
  { message: "Part ordered — spray arm thermal module", severity: "info" },
  { message: "Route optimized — tech rerouted via I-35", severity: "success" },
  { message: "Service window opened — HABITAT Unit #101", severity: "info" },
  { message: "Technician en route — 42 min ETA", severity: "info" },
  { message: "Maintenance completed — Figure-02-09 recalibrated", severity: "success" },
  { message: "Part ordered — joint actuator bearing set", severity: "info" },
  { message: "Technician assigned — Demo Technician → WO-0044", severity: "info" },
  { message: "Route optimized — dispatch path recalculated", severity: "success" },
  { message: "Service completed — HABITAT Unit #202 commissioning", severity: "success" },
  { message: "Technician dispatched to Manufacturing Cell (sample)", severity: "info" },
  { message: "Maintenance flagged — thermal threshold exceeded", severity: "warning" },
  { message: "Part ordered — DC charger control board", severity: "info" },
  { message: "Technician en route — Lena Ortiz, 28 min ETA", severity: "info" },
  { message: "Route optimized — 3 concurrent jobs rerouted", severity: "success" },
  { message: "Service completed successfully — Unitree-G1-11", severity: "success" },
  { message: "Maintenance completed — solar inverter firmware applied", severity: "success" },
];

// ── BLACKCAT SIGNAL FEED ──────────────────────────────────────────────────────

export const signalEntries: SignalEntry[] = [
  {
    id: "sig_001",
    source: "IEEE Spectrum",
    time: "2026-03-19T08:00:00.000Z",
    title: "Boston Dynamics Atlas Gen 3 enters automotive pilot program",
    summary: "General Motors partners with Boston Dynamics to deploy 40 Atlas units across three assembly plants. Early telemetry shows 94% uptime in the first operational month.",
    tags: ["Atlas", "Automotive", "Fleet Deployment"],
    category: "robotics"
  },
  {
    id: "sig_002",
    source: "TechCrunch",
    time: "2026-03-18T14:30:00.000Z",
    title: "Figure AI closes $300M Series C to scale humanoid production",
    summary: "Figure AI will use new funding to expand production capacity to 10,000 units annually by Q4 2026. Manufacturing automation and workforce displacement studies included in prospectus.",
    tags: ["Figure AI", "Funding", "Humanoid"],
    category: "robotics"
  },
  {
    id: "sig_003",
    source: "Electrek",
    time: "2026-03-18T11:00:00.000Z",
    title: "Tesla Megapack deployment hits 40 GWh globally",
    summary: "Cumulative Megapack installations cross 40 GWh milestone. Grid-scale storage economics continue improving; average levelized cost of storage now below $80/MWh in utility deployments.",
    tags: ["Tesla", "Grid Storage", "Energy"],
    category: "ev_energy"
  },
  {
    id: "sig_004",
    source: "Wired",
    time: "2026-03-17T16:00:00.000Z",
    title: "AI-generated floor plans are entering municipal permitting in three states",
    summary: "Arizona, Texas, and Tennessee pilot programs accept AI-generated architectural submissions for single-family residential permits. Average approval cycle drops from 18 to 6 days.",
    tags: ["AI Design", "Permitting", "Housing"],
    category: "construction_tech"
  },
  {
    id: "sig_005",
    source: "Bloomberg",
    time: "2026-03-17T09:45:00.000Z",
    title: "Smart city sensor networks expand as municipal IoT budgets double",
    summary: "US municipal IoT infrastructure spending forecast at $8.4B for 2026, up 97% from 2024. Traffic, environmental, and utility monitoring dominate procurement pipelines.",
    tags: ["IoT", "Municipal", "Infrastructure"],
    category: "smart_cities"
  },
  {
    id: "sig_006",
    source: "MIT Technology Review",
    time: "2026-03-16T13:00:00.000Z",
    title: "Predictive maintenance AI cuts unplanned downtime by 38% in manufacturing study",
    summary: "Cross-industry study of 214 facilities finds AI-driven predictive maintenance reduces unplanned downtime by 38% and maintenance labor costs by 22% over a 12-month window.",
    tags: ["Predictive Maintenance", "Manufacturing", "AI"],
    category: "ai"
  },
  {
    id: "sig_007",
    source: "Reuters",
    time: "2026-03-15T10:30:00.000Z",
    title: "DJI Agras T60 certified for autonomous multi-field operation in 14 US states",
    summary: "FAA Part 137 certification expanded for the DJI Agras T60 platform. Operators in approved states may now run fully autonomous spray missions without a visual observer on all flights under 400 ft AGL.",
    tags: ["DJI", "FAA", "Drone Certification"],
    category: "robotics"
  },
  {
    id: "sig_008",
    source: "Construction Dive",
    time: "2026-03-14T08:15:00.000Z",
    title: "Modular and autonomous construction methods now represent 12% of US single-family starts",
    summary: "NAHB data shows off-site and technology-assisted construction methods crossing the 12% threshold for new single-family units. Labor shortages and permit speed are driving adoption.",
    tags: ["Modular", "Autonomous Build", "Housing"],
    category: "construction_tech"
  },
  {
    id: "sig_009",
    source: "GreenBiz",
    time: "2026-03-13T14:00:00.000Z",
    title: "Bidirectional EV charging deployments grow 3x as utilities expand V2G programs",
    summary: "Vehicle-to-grid enrollment in utility programs reaches 180,000 vehicles across 22 states. Average grid revenue per enrolled EV: $420/year. Fleet operators see highest yield per asset.",
    tags: ["V2G", "EV Fleet", "Grid Revenue"],
    category: "ev_energy"
  },
  {
    id: "sig_010",
    source: "The Verge",
    time: "2026-03-12T17:00:00.000Z",
    title: "Unitree G1 EDU clears OSHA standards for shared workspace deployment",
    summary: "OSHA releases updated guidance classifying the Unitree G1 EDU as compliant with ISO 10218-1 for collaborative workspace use without fixed barriers, opening warehouse and logistics deployments.",
    tags: ["Unitree", "OSHA", "ISO 10218"],
    category: "robotics"
  },
  {
    id: "sig_011",
    source: "AGIBOT",
    time: "2026-01-01T00:00:00.000Z",
    title: "AGIBOT WORLD 2026 — open humanoid dataset flagged for TechMedix failure-pattern training",
    summary: "AGIBOT WORLD is an open-source real-world humanoid dataset covering fine-grained manipulation, dual-arm coordination, and error recovery with full annotations. Modalities: RGB(D), tactile, force, LiDAR, IMU, full-body joint states. Digital twin paired (1:1 real + sim). Priority use case: improve TechMedix failure pattern recognition for Unitree G1/H1-2. Evaluate for CaP-RL agent training loop. Status: Evaluate — open source, available now. Priority: Medium. Source: https://agibot-world.com",
    tags: ["AGIBOT", "Training Data", "Failure Recovery", "Humanoid", "CaP-RL", "Data Source"],
    category: "ai"
  },
];
