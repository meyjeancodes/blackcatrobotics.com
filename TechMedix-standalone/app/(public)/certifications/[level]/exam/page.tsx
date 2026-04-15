"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, ChevronRight, Loader2 } from "lucide-react";

// ─── Question bank ────────────────────────────────────────────────────────────
// Sourced from BCR competency areas per level. The /api/certifications/submit
// route will score against DB questions if seeded; these are the questions
// presented to the user during the exam.

const QUESTIONS: Record<
  string,
  { q: string; options: string[]; answer: number }[]
> = {
  L1: [
    {
      q: "What does LOTO stand for in robot safety protocols?",
      options: ["Lock Out Tag Out", "Log Out Turn Off", "Limit Output Timeout", "Local Override Test Order"],
      answer: 0,
    },
    {
      q: "Which component is primarily responsible for energy storage in a mobile robot?",
      options: ["Motor controller", "IMU", "Battery management system", "CAN bus"],
      answer: 2,
    },
    {
      q: "When assessing mechanical wear, what is the correct first step?",
      options: ["Replace all joints", "Visual inspection", "Run full simulation", "Update firmware"],
      answer: 1,
    },
    {
      q: "Which TechMedix feature should you use to escalate a critical robot alert?",
      options: ["Energy grid panel", "Alert severity escalation", "Telemetry export", "Marketplace listing"],
      answer: 1,
    },
    {
      q: "What is the minimum action required before starting any mechanical inspection?",
      options: ["Remove the battery", "Notify dispatch", "Apply LOTO and confirm zero-energy state", "Update the log"],
      answer: 2,
    },
  ],
  L2: [
    {
      q: "CAN bus in robotics stands for:",
      options: ["Controller Area Network", "Centralized Actuator Node", "Calibrated Axis Network", "Command And Navigate"],
      answer: 0,
    },
    {
      q: "BLDC stands for:",
      options: ["Basic Linear Drive Control", "Brushless DC", "Binary Level Drive Circuit", "Bi-directional Load Drive Controller"],
      answer: 1,
    },
    {
      q: "After replacing an IMU, the first step is:",
      options: ["Update firmware", "Calibrate the sensor", "Restart the robot", "Run FFT analysis"],
      answer: 1,
    },
    {
      q: "Which tool is best for diagnosing oscillating current draw in a servo?",
      options: ["Multimeter only", "Oscilloscope", "CAN sniffer", "Visual inspection"],
      answer: 1,
    },
    {
      q: "Post-repair validation should include:",
      options: ["Only a visual check", "A full operational test matching the pre-fault baseline", "Firmware re-flash", "Customer sign-off only"],
      answer: 1,
    },
  ],
  L3: [
    {
      q: "FFT analysis is used to:",
      options: ["Flash firmware faster", "Identify bearing defect frequencies from vibration data", "Calibrate cameras", "Map fleet GPS positions"],
      answer: 1,
    },
    {
      q: "MTBF stands for:",
      options: ["Mean Time Between Failures", "Maximum Throughput Before Fault", "Motor Torque Baseline Factor", "Modular Task Buffer Format"],
      answer: 0,
    },
    {
      q: "In FMEA, RPN is calculated as:",
      options: ["Risk × Priority × Number", "Severity × Occurrence × Detectability", "Rate × Probability × Normalization", "Reliability × Performance × Node"],
      answer: 1,
    },
    {
      q: "Fleet-level diagnostics should prioritize:",
      options: ["Individual robot cosmetics", "Cross-platform failure pattern correlation", "Single-robot logs only", "Firmware version history"],
      answer: 1,
    },
    {
      q: "L3 multi-platform certification requires expertise across at least:",
      options: ["Only Unitree platforms", "Any single platform", "4 or more distinct robot families", "DJI drones only"],
      answer: 2,
    },
  ],
  L4: [
    {
      q: "Weibull analysis in maintenance is used for:",
      options: ["Power consumption modeling", "Failure probability distribution and lifetime prediction", "Sensor calibration curves", "Spare parts pricing"],
      answer: 1,
    },
    {
      q: "EOQ in spare parts management stands for:",
      options: ["End Of Quarter", "Economic Order Quantity", "Emergency Operations Queue", "Equipment Output Quality"],
      answer: 1,
    },
    {
      q: "When leading a team of L1/L2 technicians, your primary responsibility is:",
      options: ["Doing all repairs personally", "Training, escalation criteria, and quality sign-off", "Updating firmware only", "Managing customer invoicing"],
      answer: 1,
    },
    {
      q: "Fleet architecture design at L4 should account for:",
      options: ["Individual robot aesthetics", "Enterprise integration points, uptime SLAs, and redundancy", "Single-site deployments only", "Manual dispatch queues"],
      answer: 1,
    },
    {
      q: "Predictive maintenance scheduling is best driven by:",
      options: ["Calendar-based intervals only", "Statistical failure models and real-time telemetry", "Customer requests", "Firmware changelogs"],
      answer: 1,
    },
  ],
  L5: [
    {
      q: "ISO 10218 covers:",
      options: ["Battery safety for mobile robots", "Safety requirements for industrial robots", "Drone flight regulations", "Network security for autonomous systems"],
      answer: 1,
    },
    {
      q: "Jetson AGX Thor provides approximately how many TOPS?",
      options: ["75 TOPS", "150 TOPS", "275 TOPS", "500 TOPS"],
      answer: 2,
    },
    {
      q: "ML feature engineering on robot telemetry should focus on:",
      options: ["Raw log file sizes", "Stationary patterns and noise floors", "Predictive signal features derived from failure correlations", "Only visual inspection data"],
      answer: 2,
    },
    {
      q: "IEC 62061 is a standard for:",
      options: ["Electrical wiring in factories", "Safety of machinery — functional safety of electrical control systems", "Drone certification", "Battery recycling"],
      answer: 1,
    },
    {
      q: "Platform definition authoring for a new robot family requires:",
      options: ["Only a model number", "Failure mode taxonomy, sensor map, diagnostic protocols, and parts BOM", "A marketing brief", "Customer approval only"],
      answer: 1,
    },
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "intro" | "questions" | "submitting" | "result";

interface Result {
  score: number;
  passed: boolean;
  level: string;
  threshold: number;
}

// ─── Exam page ────────────────────────────────────────────────────────────────

export default function ExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: levelParam } = use(params);
  const router = useRouter();
  const level = levelParam.toUpperCase() as keyof typeof QUESTIONS;
  const questions = QUESTIONS[level];

  const [step, setStep] = useState<Step>("intro");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  if (!questions) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-theme-40">Invalid certification level.</p>
        <Link href="/certifications" className="mt-4 inline-block text-sm text-ember hover:underline">
          ← Back to certifications
        </Link>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const q = questions[current];

  // ── Intro step ──────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <Link
            href={`/certifications/${level}`}
            className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-40 transition hover:text-theme-primary"
          >
            ← Back
          </Link>
          <p className="kicker mt-6">Exam</p>
          <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary">
            {level} Certification Exam
          </h1>
          <p className="mt-3 text-sm leading-6 text-theme-52">
            {totalQuestions} questions. Enter your details to begin. Your results will be
            recorded and a passing score qualifies you for dispatch eligibility.
          </p>
        </div>

        <div className="panel p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-50">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-xl border border-theme-10 bg-white px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-25 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-50">
              Email Address <span className="text-ember">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full rounded-xl border border-theme-10 bg-white px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-25 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            onClick={() => {
              if (!email.trim()) {
                setError("Email is required.");
                return;
              }
              setError("");
              setStep("questions");
            }}
            className="w-full rounded-full bg-ember py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90"
          >
            Begin Exam
          </button>
        </div>
      </div>
    );
  }

  // ── Questions step ──────────────────────────────────────────────────────────
  if (step === "questions") {
    const progress = ((current) / totalQuestions) * 100;

    const handleNext = async () => {
      if (selected === null) return;
      const newAnswers = [...answers, selected];

      if (current < totalQuestions - 1) {
        setAnswers(newAnswers);
        setCurrent((c) => c + 1);
        setSelected(null);
        return;
      }

      // Last question — submit
      setStep("submitting");
      try {
        const res = await fetch("/api/certifications/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, level, answers: newAnswers }),
        });
        const data: Result = await res.json();
        setResult(data);
        setStep("result");
      } catch {
        setError("Submission failed. Please try again.");
        setStep("questions");
      }
    };

    return (
      <div className="mx-auto max-w-xl space-y-8">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-40">
            <span>Question {current + 1} of {totalQuestions}</span>
            <span>{level} Exam</span>
          </div>
          <div className="h-1 rounded-full bg-theme-6">
            <div
              className="h-full rounded-full bg-ember transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="panel-elevated p-8 space-y-6">
          <p className="font-header text-xl leading-snug text-theme-primary">{q.q}</p>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={[
                  "w-full rounded-xl border px-5 py-3.5 text-left text-sm transition",
                  selected === i
                    ? "border-ember bg-ember/[0.06] text-theme-primary"
                    : "border-theme-8 bg-white text-theme-65 hover:border-theme-10 hover:text-theme-primary",
                ].join(" ")}
              >
                <span className="font-semibold mr-2 text-theme-30">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            onClick={handleNext}
            disabled={selected === null}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ember py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {current < totalQuestions - 1 ? (
              <>
                Next <ChevronRight size={13} />
              </>
            ) : (
              "Submit Exam"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Submitting ──────────────────────────────────────────────────────────────
  if (step === "submitting") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-ember" />
          <p className="text-sm text-theme-50">Scoring your exam…</p>
        </div>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────────
  if (step === "result" && result) {
    const passed = result.passed;

    return (
      <div className="mx-auto max-w-xl space-y-8">
        <div className="panel-elevated p-10 text-center space-y-5">
          {passed ? (
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          ) : (
            <XCircle className="mx-auto h-14 w-14 text-rose-500" />
          )}

          <div>
            <h1 className="font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary">
              {passed ? "You passed!" : "Not quite"}
            </h1>
            <p className="mt-3 text-sm text-theme-50">
              {passed
                ? `Congratulations — you scored ${result.score}% on the ${result.level} exam. Your result has been recorded.`
                : `You scored ${result.score}%. The passing threshold for ${result.level} is ${result.threshold}%. Review the material and try again.`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <div>
              <p className="font-header text-4xl text-theme-primary">{result.score}%</p>
              <p className="font-ui text-[0.55rem] uppercase tracking-[0.16em] text-theme-40">Your Score</p>
            </div>
            <div className="h-10 w-px bg-theme-8" />
            <div>
              <p className="font-header text-4xl text-theme-primary">{result.threshold}%</p>
              <p className="font-ui text-[0.55rem] uppercase tracking-[0.16em] text-theme-40">Pass Threshold</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {passed ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-ember px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90"
              >
                Sign In to TechMedix
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAnswers([]);
                  setCurrent(0);
                  setSelected(null);
                  setStep("intro");
                }}
                className="inline-flex items-center justify-center rounded-full bg-ember px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-ember/90"
              >
                Try Again
              </button>
            )}
            <Link
              href="/certifications"
              className="inline-flex items-center justify-center rounded-full border border-theme-12 px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-theme-55 transition hover:bg-theme-4"
            >
              All Certifications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
