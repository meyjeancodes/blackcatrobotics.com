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
  /** Inline study guide — key topics to review before taking the exam */
  studyGuide: { topic: string; detail: string }[];
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
    studyUrl: "/certifications/L1/curriculum",
    studyGuide: [
      { topic: "LOTO", detail: "Lock Out Tag Out — applied before any mechanical work. Always confirm zero-energy state before touching a robot." },
      { topic: "Battery Management", detail: "BMS monitors cell voltage, temperature, and state of charge. Low SOC + high temp = thermal risk. Never charge a swollen pack." },
      { topic: "Visual Inspection Order", detail: "Start with structural (frame, joints), then electrical (connectors, wiring), then software (status LEDs, ping, dashboard alerts)." },
      { topic: "TechMedix Alerts", detail: "Critical alerts require escalation, not acknowledgment alone. Use the severity escalation flow, not just the dismiss button." },
      { topic: "Firmware Updates", detail: "Always back up configuration before updating. Verify the robot is on stable power. Confirm correct firmware file for exact model/variant." },
    ],
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
    studyUrl: "/certifications/L2/curriculum",
    studyGuide: [
      { topic: "CAN Bus", detail: "Controller Area Network — serial protocol for inter-ECU communication. Nodes share a bus; each has an ID. Use a CAN sniffer to read joint state messages." },
      { topic: "BLDC Motors", detail: "Brushless DC motors need electronic commutation (ESC/FOC). Signs of wear: cogging, current spikes, heat. Replacement requires torque-spec re-check." },
      { topic: "IMU Calibration", detail: "After any IMU replacement, run static calibration on a level surface. Check accelerometer bias and gyro drift before returning to service." },
      { topic: "Oscilloscope Diagnostics", detail: "Use to visualize current waveforms. Oscillating draw in a servo indicates mechanical bind or winding short — not a software issue." },
      { topic: "Post-Repair Validation", detail: "Run the robot through its full operational range after any repair. Compare telemetry baseline pre- and post-fault. Document anomaly count." },
    ],
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
    studyUrl: "/certifications/L3/curriculum",
    studyGuide: [
      { topic: "FFT Analysis", detail: "Fast Fourier Transform converts vibration time-domain data to frequency domain. Bearing defect frequencies (BPFO, BPFI, BSF) appear as peaks above the noise floor." },
      { topic: "MTBF", detail: "Mean Time Between Failures = total operating time ÷ number of failures. Use fleet telemetry to trend per-platform MTBF and flag degrading units early." },
      { topic: "FMEA + RPN", detail: "Failure Mode & Effects Analysis. Risk Priority Number = Severity × Occurrence × Detectability (each 1–10). RPN > 200 triggers immediate action." },
      { topic: "Multi-Platform Diagnostics", detail: "L3 requires expertise across 4+ robot families. Failure modes differ: humanoid ankle drift ≠ drone motor overheat. Learn platform-specific baselines." },
      { topic: "Fleet-Level Correlation", detail: "Single-robot logs miss systemic issues. Correlate anomaly patterns across robots of the same model — shared failures indicate firmware or design defects." },
    ],
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
    studyUrl: "/certifications/L4/curriculum",
    studyGuide: [
      { topic: "Weibull Analysis", detail: "Statistical failure distribution model. Shape parameter β < 1 = infant mortality; β = 1 = random failure; β > 1 = wear-out. Use to predict end-of-life timing." },
      { topic: "EOQ (Economic Order Quantity)", detail: "EOQ = √(2DS/H) where D = demand, S = order cost, H = holding cost. Minimizes total spare parts inventory cost across a fleet." },
      { topic: "Predictive Maintenance Scheduling", detail: "Combine sensor thresholds (real-time) with Weibull survival curves (statistical) to schedule maintenance before failure, not after." },
      { topic: "Team Leadership", detail: "L4 signs off on work completed by L1/L2 technicians. Escalation criteria: any critical alert not resolved in 2h, any repeat failure within 30 days." },
      { topic: "Enterprise SLA Design", detail: "Fleet architecture must account for uptime SLAs (99.5%+ for production), redundancy (hot standby units), and integration points with ERP/WMS systems." },
    ],
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
    studyUrl: "/certifications/L5/curriculum",
    studyGuide: [
      { topic: "ISO 10218", detail: "Safety requirements for industrial robots and robot systems. Part 1 = robot design; Part 2 = installation and integration. Workspace separation and speed limits defined here." },
      { topic: "IEC 62061", detail: "Functional safety of electrical control systems in machinery. Defines Safety Integrity Levels (SIL 1–3). Relevant for autonomous robots operating near humans." },
      { topic: "Edge AI — Jetson AGX Thor", detail: "275 TOPS on-chip. Used for real-time VLA inference, computer vision, and sensor fusion at the edge. Know memory bandwidth limits and INT8 vs FP16 trade-offs." },
      { topic: "ML Feature Engineering", detail: "Stationary signal features (RMS, kurtosis, crest factor) outperform raw time-series for failure classification. Derive features from accelerometer, current, and joint torque data." },
      { topic: "Platform Definition Authoring", detail: "A new platform definition requires: failure mode taxonomy (component → symptom → cause), sensor map (what signals are available), diagnostic protocols, and parts BOM with lead times." },
    ],
  },
];
