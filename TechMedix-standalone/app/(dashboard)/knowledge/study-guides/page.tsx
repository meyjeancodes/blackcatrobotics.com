import Link from "next/link";
import { CERT_LEVELS } from "@/lib/cert-levels";

export const metadata = {
  title: "Study Guides | TechMedix Knowledge",
};

// ─── Study guide content per certification level ────────────────────────────
// All content is self-hosted. No external redirects.

const STUDY_GUIDES: Record<string, {
  overview: string;
  topics: { title: string; description: string; estimatedMinutes: number }[];
  resources: { label: string; type: "module" | "article" | "quiz"; href: string }[];
}> = {
  L1: {
    overview: "Foundation-level guide covering robot safety, basic inspection, battery service, and TechMedix dashboard operation. Required reading before the L1 Operator exam.",
    topics: [
      { title: "Robot Safety Fundamentals", description: "LOTO protocols, hazard zones, PPE requirements, emergency stop procedures across all platform categories.", estimatedMinutes: 25 },
      { title: "Basic Mechanical Inspection", description: "Visual inspection methodology, wear indicators, documentation standards, and escalation criteria for L1 technicians.", estimatedMinutes: 30 },
      { title: "Battery and Power Systems", description: "Li-ion and LFP chemistry basics, cycle life, state-of-charge monitoring, thermal runaway indicators, safe handling.", estimatedMinutes: 20 },
      { title: "Firmware Updates", description: "OTA update procedures, rollback protocols, version compatibility, and post-update validation checklist.", estimatedMinutes: 15 },
      { title: "TechMedix Dashboard Operation", description: "Alert triage, logging a service event, escalating to L2, fleet health view, and report generation.", estimatedMinutes: 20 },
    ],
    resources: [
      { label: "L1 Training Modules", type: "module", href: "/knowledge/modules" },
      { label: "Robot Safety Quiz", type: "quiz", href: "/knowledge/certifications" },
      { label: "Take L1 Exam", type: "quiz", href: "/certifications/L1/exam" },
    ],
  },
  L2: {
    overview: "Intermediate guide covering full mechanical repair, actuator replacement, sensor calibration, and AR-assisted diagnostics. Requires L1 certification.",
    topics: [
      { title: "Diagnostic Tooling", description: "CAN bus analysis, oscilloscope use on motor controllers, ROS 2 topic inspection, TechMedix signal viewer.", estimatedMinutes: 40 },
      { title: "Actuator Replacement — BLDC Motors", description: "Brushless DC motor R&R procedure, torque constant verification, cogging test, and post-install validation.", estimatedMinutes: 45 },
      { title: "Harmonic Drive Service", description: "Harmonic reducer disassembly, wear pattern identification, grease service intervals, and backlash measurement.", estimatedMinutes: 35 },
      { title: "Sensor Calibration", description: "IMU offset calibration, F/T sensor tare and range verification, LiDAR boresight, camera intrinsic calibration.", estimatedMinutes: 40 },
      { title: "AR-Assisted Diagnostics", description: "XpertEYE / RealWear setup, remote expert session workflow, annotation reading, documentation from AR session logs.", estimatedMinutes: 25 },
    ],
    resources: [
      { label: "L2 Training Modules", type: "module", href: "/knowledge/modules" },
      { label: "CAD Simulation — Actuator Lab", type: "module", href: "/knowledge/simulations" },
      { label: "Take L2 Exam", type: "quiz", href: "/certifications/L2/exam" },
    ],
  },
  L3: {
    overview: "Specialist-level guide covering multi-platform diagnostics, FFT vibration analysis, fleet-level MTBF trending, and advanced FMEA. Requires L2 + 6 months field experience.",
    topics: [
      { title: "Multi-Platform Diagnostic Protocols", description: "Cross-platform failure signature comparison across humanoid, AMR, and drone categories. Diagnostic decision trees.", estimatedMinutes: 50 },
      { title: "FFT Vibration Analysis", description: "Bearing defect frequency calculation, waterfall plot interpretation, sideband analysis for gearbox health.", estimatedMinutes: 45 },
      { title: "Fleet-Level MTBF Trending", description: "Weibull analysis from TechMedix fleet data, failure rate calculation, scheduled maintenance interval optimization.", estimatedMinutes: 40 },
      { title: "Advanced FMEA", description: "RPN scoring methodology, risk priority ranking, escalation matrix construction, and preventive action documentation.", estimatedMinutes: 35 },
    ],
    resources: [
      { label: "L3 Training Modules", type: "module", href: "/knowledge/modules" },
      { label: "CAD Simulation — Multi-Platform Lab", type: "module", href: "/knowledge/simulations" },
      { label: "Take L3 Exam", type: "quiz", href: "/certifications/L3/exam" },
    ],
  },
  L4: {
    overview: "Systems Engineer guide covering fleet architecture, enterprise integrations, spare parts optimization, and technician team leadership.",
    topics: [
      { title: "Fleet Architecture Design", description: "Zone-based fleet management, redundancy planning, integration with ERP and CMMS systems, TechMedix API configuration.", estimatedMinutes: 60 },
      { title: "Weibull Failure Analysis", description: "Two-parameter Weibull fitting from TechMedix telemetry, shape and scale interpretation, maintenance schedule derivation.", estimatedMinutes: 45 },
      { title: "Spare Parts EOQ Optimization", description: "Economic order quantity calculation, safety stock modeling, lead time analysis, and supplier qualification checklist.", estimatedMinutes: 35 },
      { title: "Team Leadership Protocols", description: "L1/L2 onboarding, job escalation criteria, field review process, technician performance metrics.", estimatedMinutes: 30 },
    ],
    resources: [
      { label: "L4 Training Modules", type: "module", href: "/knowledge/modules" },
      { label: "Take L4 Exam", type: "quiz", href: "/certifications/L4/exam" },
    ],
  },
  L5: {
    overview: "Architect-level guide covering ML on robot telemetry, edge AI deployment, platform definition authoring, and ISO compliance. Requires L4 + enterprise project lead experience.",
    topics: [
      { title: "ML Feature Engineering on Telemetry", description: "Rolling statistics, spectral features, anomaly detection models trained on TechMedix signal streams.", estimatedMinutes: 75 },
      { title: "Edge AI Deployment", description: "NVIDIA Jetson AGX Thor deployment, TensorRT optimization, inference latency benchmarking, model update procedures.", estimatedMinutes: 60 },
      { title: "Platform Definition Authoring", description: "How to author a new robot platform definition in TechMedix — failure signatures, repair protocols, sensor mappings.", estimatedMinutes: 45 },
      { title: "Standards and Compliance", description: "ISO 10218 robot safety, IEC 62061 functional safety, CE marking requirements, OSHA 1910.217 compliance checklist.", estimatedMinutes: 40 },
    ],
    resources: [
      { label: "L5 Training Modules", type: "module", href: "/knowledge/modules" },
      { label: "CAD Simulation — Full Platform Lab", type: "module", href: "/knowledge/simulations" },
      { label: "Take L5 Exam", type: "quiz", href: "/certifications/L5/exam" },
    ],
  },
};

const TYPE_STYLES: Record<string, string> = {
  module: "bg-sky-500/10 border-sky-500/25 text-sky-600",
  article: "bg-theme-2 border-theme-10 text-theme-50",
  quiz:    "bg-ember/10 border-ember/25 text-ember",
};

export default async function StudyGuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const activeLevel = level ?? "L1";
  const guide = STUDY_GUIDES[activeLevel];
  const levelMeta = CERT_LEVELS.find((l) => l.id === activeLevel);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">TechMedix Training</p>
        <h1 className="mt-2 font-header text-3xl leading-tight text-theme-primary">Study Guides</h1>
        <p className="mt-2 text-sm text-theme-55">
          Self-hosted study material for each certification level. No external redirects.
        </p>
      </div>

      {/* Level tabs */}
      <div className="flex flex-wrap gap-2">
        {CERT_LEVELS.map((level) => (
          <Link
            key={level.id}
            href={`/knowledge/study-guides?level=${level.id}`}
            className={[
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] border transition-colors",
              activeLevel === level.id
                ? `${level.badgeColor} text-white border-transparent`
                : "border-theme-10 text-theme-45 hover:text-theme-65 hover:border-theme-20",
            ].join(" ")}
          >
            {level.id} — {level.title}
          </Link>
        ))}
      </div>

      {guide && levelMeta && (
        <>
          {/* Guide overview */}
          <div className="panel-elevated p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-header text-lg font-bold text-white ${levelMeta.badgeColor}`}>
                {levelMeta.id}
              </div>
              <div>
                <h2 className="font-header text-xl text-theme-primary mb-1">
                  {levelMeta.id} — {levelMeta.title} Study Guide
                </h2>
                <p className="text-theme-55 text-sm leading-relaxed">{guide.overview}</p>
              </div>
            </div>
          </div>

          {/* Topics */}
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.30em] text-theme-30 mb-4">
              Topics Covered
            </p>
            <div className="space-y-3">
              {guide.topics.map((topic, i) => (
                <div
                  key={topic.title}
                  className="panel p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="font-ui text-[0.55rem] uppercase tracking-widest text-theme-25 mt-0.5 w-4 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-theme-primary text-sm font-medium mb-1">{topic.title}</p>
                        <p className="text-theme-50 text-xs leading-relaxed">{topic.description}</p>
                      </div>
                    </div>
                    <span className="shrink-0 font-ui text-[0.55rem] uppercase tracking-widest text-theme-25">
                      {topic.estimatedMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="font-ui text-[0.60rem] uppercase tracking-[0.30em] text-theme-30 mb-4">
              Resources
            </p>
            <div className="flex flex-wrap gap-3">
              {guide.resources.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] transition-opacity hover:opacity-80 ${TYPE_STYLES[r.type]}`}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
