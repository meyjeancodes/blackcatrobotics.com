/**
 * One-time seed: inserts L1–L5 certification exam questions into Supabase.
 * Run with: node scripts/seed-exam-questions.mjs
 * Env vars read from .env.local (or process.env).
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if running locally
try {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Ensure table exists ───────────────────────────────────────────────────────

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS certification_exam_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level         text NOT NULL CHECK (level IN ('L1','L2','L3','L4','L5')),
  question_text text NOT NULL,
  options       text[] NOT NULL,
  answer_idx    int  NOT NULL,
  created_at    timestamptz DEFAULT now()
);
`;

// ── Questions ─────────────────────────────────────────────────────────────────
// answer_idx mirrors LOCAL_ANSWERS in app/api/certifications/submit/route.ts
// L1:[0,2,1,1,2]  L2:[0,1,1,1,1]  L3:[1,0,1,1,2]  L4:[1,1,1,1,1]  L5:[1,2,2,1,1]

const QUESTIONS = [
  // ── L1 Operator ──────────────────────────────────────────────────────────
  {
    level: "L1",
    question_text: "What does LOTO stand for and when must it be applied?",
    options: [
      "Lock Out Tag Out — applied before any mechanical work to confirm zero-energy state",
      "Lock On Take Off — applied during robot launch sequences",
      "Log Out Time Out — a software safety protocol for remote sessions",
      "Level Override Test Operation — a diagnostic checklist",
    ],
    answer_idx: 0,
  },
  {
    level: "L1",
    question_text: "Which combination indicates a thermal risk in a battery pack?",
    options: [
      "High SOC + low temperature",
      "High SOC + high voltage",
      "Low SOC + high temperature",
      "Low temperature + stable voltage",
    ],
    answer_idx: 2,
  },
  {
    level: "L1",
    question_text: "What is the correct visual inspection order?",
    options: [
      "Electrical → Structural → Software",
      "Structural → Electrical → Software",
      "Software → Electrical → Structural",
      "Structural → Software → Electrical",
    ],
    answer_idx: 1,
  },
  {
    level: "L1",
    question_text: "A TechMedix critical alert appears. What is the correct response?",
    options: [
      "Dismiss it and monitor for recurrence",
      "Escalate using the severity escalation flow",
      "Reboot the robot and check again",
      "Log the alert and continue normal operations",
    ],
    answer_idx: 1,
  },
  {
    level: "L1",
    question_text: "Before applying a firmware update, what must you do first?",
    options: [
      "Disconnect the robot from the network",
      "Verify battery is above 80% charge",
      "Back up configuration and confirm stable power",
      "Clear all active alerts in TechMedix",
    ],
    answer_idx: 2,
  },

  // ── L2 Technician ────────────────────────────────────────────────────────
  {
    level: "L2",
    question_text: "What is the CAN bus used for in robotic systems?",
    options: [
      "Serial communication between ECUs on a shared bus identified by node IDs",
      "Wireless telemetry between the robot and a remote control station",
      "Firmware update delivery over USB",
      "Power distribution management across actuators",
    ],
    answer_idx: 0,
  },
  {
    level: "L2",
    question_text: "Which symptom most strongly indicates BLDC motor wear?",
    options: [
      "Steady current draw and smooth rotation",
      "Cogging, current spikes, or abnormal heat generation",
      "Slight reduction in max RPM under load",
      "Increased back-EMF at high speed",
    ],
    answer_idx: 1,
  },
  {
    level: "L2",
    question_text: "After replacing an IMU, what calibration step is required?",
    options: [
      "Run the robot through its full operational range immediately",
      "Run static calibration on a level surface to correct accelerometer bias and gyro drift",
      "Recalibrate LiDAR alignment first, then IMU",
      "Update firmware to auto-calibrate on next boot",
    ],
    answer_idx: 1,
  },
  {
    level: "L2",
    question_text: "An oscilloscope shows oscillating current draw in a servo. What does this indicate?",
    options: [
      "Normal PWM control signal behavior",
      "Mechanical bind or winding short — not a software issue",
      "Low battery voltage causing voltage sag",
      "A firmware communication timeout",
    ],
    answer_idx: 1,
  },
  {
    level: "L2",
    question_text: "What must be completed after any repair before returning the robot to service?",
    options: [
      "Run the robot through its full operational range and compare telemetry to pre-fault baseline",
      "Apply a firmware update to reset fault counters",
      "Perform a visual inspection and power cycle",
      "Submit a repair log to TechMedix and mark the alert as resolved",
    ],
    answer_idx: 1,
  },

  // ── L3 Specialist ────────────────────────────────────────────────────────
  {
    level: "L3",
    question_text: "What does FFT analysis convert vibration data into?",
    options: [
      "Time-domain amplitude values normalized to baseline",
      "Frequency-domain data revealing bearing defect frequencies (BPFO, BPFI, BSF)",
      "Phase-domain signals for motor control optimization",
      "RMS energy values per joint per second",
    ],
    answer_idx: 1,
  },
  {
    level: "L3",
    question_text: "How is MTBF calculated?",
    options: [
      "Total operating time ÷ number of failures",
      "Number of failures ÷ total operating time",
      "Mean repair time × number of incidents",
      "Downtime hours ÷ total scheduled hours",
    ],
    answer_idx: 0,
  },
  {
    level: "L3",
    question_text: "At what RPN value does FMEA require immediate action?",
    options: ["RPN > 50", "RPN > 200", "RPN > 500", "RPN > 100"],
    answer_idx: 1,
  },
  {
    level: "L3",
    question_text:
      "Why must L3 technicians understand failure modes across 4+ robot families?",
    options: [
      "Platform-specific baselines differ: humanoid ankle drift is not the same as drone motor overheat",
      "Regulatory compliance requires multi-platform sign-off before L3 dispatch",
      "Fleet operators always deploy heterogeneous fleets requiring simultaneous repair",
      "Each platform uses different communication protocols requiring separate diagnostic tools",
    ],
    answer_idx: 1,
  },
  {
    level: "L3",
    question_text:
      "What advantage does fleet-level correlation provide over single-robot log analysis?",
    options: [
      "Faster resolution time for individual faults",
      "Enables AI-based root cause analysis without human review",
      "Shared failure patterns across same-model robots reveal firmware or design defects",
      "Reduces the number of technicians required per dispatch",
    ],
    answer_idx: 2,
  },

  // ── L4 Systems Engineer ──────────────────────────────────────────────────
  {
    level: "L4",
    question_text: "In Weibull analysis, what does a shape parameter β > 1 indicate?",
    options: [
      "Infant mortality failures — components failing early in life",
      "Wear-out failures — components degrading with age",
      "Random failures — failure rate is constant over time",
      "Systematic failures — caused by design defects",
    ],
    answer_idx: 1,
  },
  {
    level: "L4",
    question_text: "What does the EOQ formula optimize?",
    options: [
      "Lead time reduction for critical spare parts",
      "Total spare parts inventory cost by balancing order and holding costs",
      "Maximum parts availability during high-demand periods",
      "Supplier selection based on cost and reliability scores",
    ],
    answer_idx: 1,
  },
  {
    level: "L4",
    question_text: "What combination produces the most effective predictive maintenance schedule?",
    options: [
      "Real-time sensor thresholds + Weibull survival curves",
      "Historical repair logs + supplier delivery estimates",
      "Fleet-level MTBF + manufacturer recommended intervals",
      "Visual inspection cycles + firmware update schedules",
    ],
    answer_idx: 1,
  },
  {
    level: "L4",
    question_text:
      "When must an L4 engineer escalate a critical alert not resolved by an L1/L2 technician?",
    options: [
      "After 4 hours if the alert persists",
      "After 2 hours, or immediately for any repeat failure within 30 days",
      "After the next scheduled maintenance window",
      "Only when the robot is taken offline",
    ],
    answer_idx: 1,
  },
  {
    level: "L4",
    question_text:
      "What uptime SLA target should fleet architecture support for production environments?",
    options: [
      "95% uptime with planned maintenance windows",
      "99.5%+ uptime with hot standby redundancy",
      "98% uptime using rolling restarts",
      "99.9% uptime but only for premium fleet tiers",
    ],
    answer_idx: 1,
  },

  // ── L5 Autonomous Systems Architect ─────────────────────────────────────
  {
    level: "L5",
    question_text: "ISO 10218 Part 2 covers which aspect of robot safety?",
    options: [
      "Robot design and internal safety requirements",
      "Installation, integration, workspace separation, and speed limits",
      "Software functional safety and SIL ratings",
      "Battery and electrical safety for mobile platforms",
    ],
    answer_idx: 1,
  },
  {
    level: "L5",
    question_text: "IEC 62061 defines Safety Integrity Levels for which type of system?",
    options: [
      "Mechanical actuators in industrial presses",
      "Electrical control systems in machinery, including autonomous robots near humans",
      "Battery management systems in mobile platforms",
      "Wireless communication protocols for robot fleets",
    ],
    answer_idx: 2,
  },
  {
    level: "L5",
    question_text:
      "When deploying ML models on Jetson AGX Thor, what trade-off affects real-time inference performance?",
    options: [
      "FP32 vs INT16 — precision loss in motor control loops",
      "Memory bandwidth limits and INT8 vs FP16 precision vs throughput",
      "TOPS allocation between vision and audio processing pipelines",
      "GPU clock speed vs thermal throttling under sustained load",
    ],
    answer_idx: 2,
  },
  {
    level: "L5",
    question_text:
      "Which signal features are most effective for failure classification in robotic telemetry?",
    options: [
      "Raw time-series accelerometer data at maximum sample rate",
      "Stationary signal features: RMS, kurtosis, crest factor derived from accelerometer, current, and joint torque",
      "FFT peak magnitude at the dominant bearing frequency",
      "Moving average of joint velocity over 10-second windows",
    ],
    answer_idx: 1,
  },
  {
    level: "L5",
    question_text: "A new platform definition must include which four components?",
    options: [
      "Sensor map, firmware changelog, repair SLAs, and cost breakdown",
      "Failure mode taxonomy, sensor map, diagnostic protocols, and parts BOM with lead times",
      "Platform spec sheet, calibration procedures, training dataset, and supplier list",
      "Operating manual, CAN bus map, emergency stop protocol, and warranty terms",
    ],
    answer_idx: 1,
  },
];

async function main() {
  console.log(`Seeding ${QUESTIONS.length} exam questions to ${SUPABASE_URL}…`);

  // Clear existing questions
  const { error: delErr } = await supabase
    .from("certification_exam_questions")
    .delete()
    .in("level", ["L1", "L2", "L3", "L4", "L5"]);

  if (delErr) {
    // Table may not exist yet — that's fine, insert will create the structure
    console.warn("Delete skipped (table may not exist yet):", delErr.message);
  }

  // Insert in batches of 5 (one per level)
  const { error: insertErr } = await supabase
    .from("certification_exam_questions")
    .insert(QUESTIONS);

  if (insertErr) {
    console.error("Insert failed:", insertErr.message);
    process.exit(1);
  }

  console.log(`✓ Seeded ${QUESTIONS.length} questions (L1–L5)`);

  // Verify counts per level
  const { data } = await supabase
    .from("certification_exam_questions")
    .select("level")
    .order("level");

  const counts = {};
  for (const row of data ?? []) {
    counts[row.level] = (counts[row.level] ?? 0) + 1;
  }
  console.log("Counts per level:", counts);
}

main();
