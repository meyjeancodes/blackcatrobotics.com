// Shared certification level data — no "use client", safe to import in server components

export interface CertLevel {
  id: "L1" | "L2" | "L3" | "L4" | "L5";
  title: string;
  price: string;
  jobValueRange: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  covers: string[];
  competencies: string[];
  prerequisites: string;
  studyUrl: string;
}

export const CERT_LEVELS: CertLevel[] = [
  {
    id: "L1",
    title: "Operator",
    price: "$199",
    jobValueRange: "$280 – $350 / job",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeColor: "bg-emerald-600",
    covers: [
      "Basic maintenance",
      "Visual inspection",
      "Battery service",
      "Firmware updates",
    ],
    competencies: [
      "Robot safety fundamentals and LOTO protocols",
      "Basic mechanical inspection and wear assessment",
      "Battery and power system monitoring",
      "TechMedix dashboard — alerts, logging, escalation",
    ],
    prerequisites: "None — entry level",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L1_operator",
  },
  {
    id: "L2",
    title: "Technician",
    price: "$399",
    jobValueRange: "$450 – $650 / job",
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    badgeColor: "bg-sky-600",
    covers: [
      "Full mechanical repair",
      "Actuator replacement",
      "AR-assisted diagnostics",
    ],
    competencies: [
      "Diagnostic tools: CAN bus, oscilloscope, ROS 2",
      "Actuator R&R — BLDC motors, harmonic drives",
      "Sensor calibration — IMU, F/T, camera, LiDAR",
      "Firmware update and post-repair validation",
    ],
    prerequisites: "L1 Operator certification",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L2_technician",
  },
  {
    id: "L3",
    title: "Specialist",
    price: "$699",
    jobValueRange: "$800 – $1,100 / job",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    badgeColor: "bg-violet-600",
    covers: [
      "Multi-platform diagnostics",
      "Sensor calibration",
      "Advanced fault resolution",
    ],
    competencies: [
      "Multi-platform diagnostics across 4+ robot families",
      "FFT analysis and bearing defect frequency calculation",
      "Fleet-level diagnostics and MTBF trending",
      "Advanced FMEA — RPN scoring, risk escalation",
    ],
    prerequisites: "L2 Technician certification + 6 months field experience",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L3_specialist",
  },
  {
    id: "L4",
    title: "Systems Engineer",
    price: "$999",
    jobValueRange: "$1,200 – $1,800 / job",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeColor: "bg-amber-600",
    covers: [
      "Fleet system architecture",
      "ERP integration support",
      "Enterprise diagnostics",
    ],
    competencies: [
      "Fleet architecture design and enterprise integrations",
      "Weibull failure analysis and predictive maintenance scheduling",
      "Spare parts EOQ optimization and supply chain management",
      "Team leadership — training L1/L2 technicians, job escalation",
    ],
    prerequisites: "L3 Specialist + 12 months multi-platform field experience",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L4_systems_engineer",
  },
  {
    id: "L5",
    title: "Autonomous Systems Architect",
    price: "$1,499",
    jobValueRange: "$2,500+ / job",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    badgeColor: "bg-rose-600",
    covers: [
      "Full-stack autonomous system diagnosis",
      "Custom protocol development",
      "Top-tier enterprise jobs",
    ],
    competencies: [
      "ML feature engineering on robot telemetry streams",
      "Edge AI deployment — Jetson AGX Thor, 275 TOPS",
      "Platform definition authoring for new robot families",
      "Standards and compliance: ISO 10218, IEC 62061",
    ],
    prerequisites: "L4 Systems Engineer + enterprise project lead experience",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L5_autonomous_architect",
  },
];
