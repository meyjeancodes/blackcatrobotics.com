"use client";

import { useState } from "react";
import { SurfaceCard } from "../../../components/surface-card";
import { CheckCircle, XCircle, BookOpen, Award, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const LEVELS = [
  {
    level: "L1",
    title: "Operator",
    salary: "$28-35K",
    jobValue: "$280–350/job",
    fee: "$199",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    description: "Entry-level certification. Basic maintenance tasks, on-demand dispatch eligibility.",
    unlocks: ["Basic maintenance procedures", "Entry dispatch jobs", "TechMedix dashboard access"],
    curriculum: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L1",
  },
  {
    level: "L2",
    title: "Technician",
    salary: "$45-55K",
    jobValue: "$450–550/job",
    fee: "$399",
    color: "bg-sky-500",
    textColor: "text-sky-600",
    description: "Full repair authorization. AR-guided maintenance access enabled.",
    unlocks: ["Full repair authorization", "AR Mode access", "Component-level diagnostics", "DJI drone service procedures"],
    curriculum: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L2",
  },
  {
    level: "L3",
    title: "Specialist",
    salary: "$62-75K",
    jobValue: "$650–800/job",
    fee: "$699",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    description: "Multi-platform certification. Advanced diagnostic suite and enterprise job access.",
    unlocks: ["Multi-platform support", "Advanced diagnostics", "HABITAT build supervision", "Sensor calibration"],
    curriculum: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L3",
  },
  {
    level: "L4",
    title: "Systems Engineer",
    salary: "$80-95K",
    jobValue: "$1,000–1,500/job",
    fee: "$999",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    description: "Fleet systems integration and enterprise-scale job eligibility.",
    unlocks: ["Fleet systems integration", "Enterprise job access", "API-level platform access"],
    curriculum: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L4",
  },
  {
    level: "L5",
    title: "Autonomous Systems Architect",
    salary: "$110K+",
    jobValue: "$2,500+/job",
    fee: "$1,499",
    color: "bg-[#e8601e]",
    textColor: "text-[#e8601e]",
    description: "Top tier. Highest job value. Autonomous systems design and oversight.",
    unlocks: ["Autonomous systems design", "Highest-value job pool", "Platform certification review"],
    curriculum: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/levels/L5",
  },
];

const PLATFORM_MODULES = [
  {
    id: "unitree-g1",
    name: "Unitree G1",
    maker: "Unitree Robotics",
    badge: "Humanoid",
    badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    difficulty: "L2–L3",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=80",
    description: "43 DOF humanoid platform. Joint diagnostics, gait calibration, F/T sensor maintenance.",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/platforms",
  },
  {
    id: "unitree-h1-2",
    name: "Unitree H1-2",
    maker: "Unitree Robotics",
    badge: "Full-Size Humanoid",
    badgeColor: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    difficulty: "L3–L4",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=80",
    description: "Full-size industrial humanoid. Advanced locomotion systems and enterprise deployment.",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/platforms",
  },
  {
    id: "bd-spot",
    name: "Boston Dynamics Spot",
    maker: "Boston Dynamics",
    badge: "Quadruped",
    badgeColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    difficulty: "L2–L3",
    image: "https://images.unsplash.com/photo-1612358405970-e2f67b37c4e5?w=400&auto=format&fit=crop&q=80",
    description: "Industrial inspection quadruped. Modular payload systems, API integration, payload calibration.",
    studyUrl: "https://github.com/blackcatrobotics/blackcat-os/tree/main/certifications/platforms",
  },
  {
    id: "dji-agras-t50",
    name: "DJI Agras T50",
    maker: "DJI Agriculture",
    badge: "Agricultural Drone",
    badgeColor: "bg-[#1db87a]/10 text-[#1db87a] border-[#1db87a]/20",
    difficulty: "L2",
    image: "https://images.unsplash.com/photo-1644710564412-c1cc7f37eda6?w=400&auto=format&fit=crop&q=80",
    description: "Professional agricultural drone. 40 kg payload, 40L spray tank, AI route planning.",
    studyUrl: "/drones",
    special: "Includes Care Refresh Procedures",
  },
];

// Inline quiz questions — in production these would come from the questions.json files
const QUIZ_QUESTIONS: Record<string, {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}[]> = {
  L1: [
    {
      question: "What is the first step when performing a routine inspection on a Unitree G1?",
      options: [
        "Power on and run full gait cycle",
        "Power off and check for physical damage before powering on",
        "Connect to TechMedix dashboard immediately",
        "Run joint calibration sequence",
      ],
      correct: 1,
      explanation: "Always power off and perform a visual inspection before connecting power. This prevents actuating into damage.",
    },
    {
      question: "A robot's health score drops below 60. What is the recommended action in TechMedix?",
      options: [
        "MONITOR — continue operation with increased telemetry frequency",
        "SERVICE — schedule technician inspection within 48 hours",
        "GROUND — remove from service immediately",
        "CLAIM — file DJI Care Refresh claim",
      ],
      correct: 1,
      explanation: "A score below 60 triggers SERVICE status. The robot continues operation but must be inspected within 48 hours.",
    },
    {
      question: "What does BlackCat take from each dispatched job at L1?",
      options: ["10%", "15–20%", "25–30%", "Flat $50 fee"],
      correct: 1,
      explanation: "BlackCat takes 15–20% per dispatched job. This funds platform operations, insurance, and dispatch infrastructure.",
    },
  ],
  L2: [
    {
      question: "A DJI Agras T50's gimbal shows drift_detected: true in a TechMedix diagnostic. What is the recommended action?",
      options: [
        "Replace gimbal assembly immediately",
        "Run DJI auto-calibration from the DJI Pilot app",
        "File a DJI Care Refresh claim",
        "Ground the drone — unsafe to fly",
      ],
      correct: 1,
      explanation: "Gimbal drift is typically corrected by DJI auto-calibration. Physical replacement is only needed if calibration fails repeatedly.",
    },
    {
      question: "Which DJI Care Refresh plan covers flyaway incidents?",
      options: [
        "1-Year standard plan",
        "2-Year standard plan",
        "Care Refresh+ (Combo plan only)",
        "Both 1-Year and 2-Year plans",
      ],
      correct: 2,
      explanation: "Flyaway coverage requires the Care Refresh+ (Combo) plan. Standard 1-Year and 2-Year plans do NOT cover flyaways.",
    },
    {
      question: "When uploading a DJI flight log for a flyaway claim, what is required?",
      options: [
        "Pilot selfie at the launch site",
        "GPS records showing last known location and signal loss event",
        "Receipt for the drone purchase",
        "Insurance certificate",
      ],
      correct: 1,
      explanation: "Flyaway claims require GPS flight records from DJI Fly or DJI GO app showing the flight path, last known GPS position, and the signal loss event.",
    },
  ],
};

const FAQS = [
  {
    q: "Is the curriculum really free?",
    a: "Yes. The BlackCat OS curriculum is open source under the Apache 2.0 license. All study materials, guides, and practice content are free to use, modify, and redistribute. The curriculum lives on GitHub at github.com/blackcatrobotics/blackcat-os.",
  },
  {
    q: "How do I get the actual certification badge?",
    a: "Study the open-source curriculum for free, then pass the proctored AI-evaluated exam through TechMedix. Exams are administered through this dashboard. Upon passing, you receive your certified badge and become dispatch-eligible immediately.",
  },
  {
    q: "How much can I earn?",
    a: "Earnings scale with certification level. L1 Operators earn $280–350/job. L2 Technicians earn $450–550/job. L3 Specialists earn $650–800/job. L4 Systems Engineers earn $1,000–1,500/job. L5 Architects earn $2,500+/job. BlackCat takes 15–20% per dispatch; you keep the rest.",
  },
  {
    q: "Can I contribute to the curriculum?",
    a: "Yes! The curriculum is community-maintained. Submit PRs to the GitHub repo, report errors, add platform-specific guides, or translate content. Contributors who substantially improve the curriculum may qualify for reduced certification fees.",
  },
  {
    q: "What is the DJI Agras T50 Platform Module?",
    a: "It's a specialized L2+ module covering DJI agricultural drone maintenance: motor and propeller service, spray system calibration, radar/vision obstacle avoidance diagnostics, DJI Care Refresh claim procedures, and flight log analysis. It's integrated with TechMedix's drone fleet module.",
  },
];

function QuizWidget() {
  const [selectedLevel, setSelectedLevel] = useState("L1");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const questions = QUIZ_QUESTIONS[selectedLevel] ?? [];
  const question = questions[currentQ];

  const handleAnswer = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    if (optIdx === question.correct) setScore((s) => s + 1);
    setAnswered((a) => a + 1);
  };

  const nextQuestion = () => {
    setSelected(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswered(0);
  };

  const handleLevelChange = (l: string) => {
    setSelectedLevel(l);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswered(0);
  };

  return (
    <div className="space-y-5">
      {/* Level selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/35">Level:</span>
        {Object.keys(QUIZ_QUESTIONS).map((l) => (
          <button
            key={l}
            onClick={() => handleLevelChange(l)}
            className={`rounded-full border px-3.5 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.14em] transition-all ${
              selectedLevel === l
                ? "bg-[#e8601e] text-white border-[#e8601e]"
                : "border-black/10 text-black/50 hover:border-black/20"
            }`}
          >
            {l}
          </button>
        ))}
        <span className="ml-auto font-ui text-[0.60rem] uppercase tracking-[0.14em] text-black/35">
          Score: {score}/{answered}
        </span>
      </div>

      {!question ? (
        <div className="panel p-6 text-center">
          <p className="text-sm text-black/45">No questions for this level yet.</p>
        </div>
      ) : answered === questions.length ? (
        <div className="panel p-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
              score === questions.length ? "bg-[#1db87a]/10" : "bg-amber-500/10"
            }`}>
              {score === questions.length
                ? <CheckCircle size={28} className="text-[#1db87a]" />
                : <Award size={28} className="text-amber-500" />
              }
            </div>
          </div>
          <p className="font-header text-xl text-black">
            {score}/{questions.length} correct
          </p>
          <p className="text-sm text-black/50">
            {score === questions.length
              ? "Perfect score! You're ready for the certification exam."
              : "Review the explanations and study the relevant curriculum modules."}
          </p>
          <button
            onClick={resetQuiz}
            className="rounded-full border border-black/10 px-5 py-2 text-sm text-black/60 hover:border-black/20 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      ) : (
        <div className="panel p-6 space-y-5">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-black/35">
                Question {currentQ + 1} of {questions.length}
              </span>
              <span className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-black/35">
                {selectedLevel}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-black/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#e8601e] transition-all duration-300"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <p className="text-base font-semibold text-black/85 leading-snug">{question.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === question.correct;
              const showResult = selected !== null;

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full text-left rounded-[16px] border px-4 py-3 text-sm transition-all duration-150 ${
                    showResult
                      ? isCorrect
                        ? "bg-[#1db87a]/[0.08] border-[#1db87a]/30 text-[#1db87a]"
                        : isSelected
                        ? "bg-[#e8601e]/[0.08] border-[#e8601e]/30 text-[#e8601e]"
                        : "border-black/[0.05] text-black/35 opacity-50"
                      : "border-black/[0.07] text-black/70 hover:border-[#e8601e]/30 hover:bg-[#e8601e]/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-ui text-[0.60rem] font-semibold ${
                      showResult && isCorrect ? "bg-[#1db87a] text-white" :
                      showResult && isSelected ? "bg-[#e8601e] text-white" :
                      "bg-black/[0.05] text-black/40"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {showResult && isCorrect && <CheckCircle size={14} className="ml-auto shrink-0 text-[#1db87a]" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={14} className="ml-auto shrink-0 text-[#e8601e]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {selected !== null && (
            <div className={`rounded-[16px] border p-4 text-sm leading-relaxed ${
              selected === question.correct
                ? "bg-[#1db87a]/[0.06] border-[#1db87a]/20 text-[#1db87a]/90"
                : "bg-amber-500/[0.06] border-amber-500/20 text-amber-700"
            }`}>
              <span className="font-semibold">
                {selected === question.correct ? "Correct! " : "Not quite. "}
              </span>
              {question.explanation}
            </div>
          )}

          {selected !== null && currentQ < questions.length - 1 && (
            <button
              onClick={nextQuestion}
              className="w-full rounded-full bg-[#e8601e] py-2.5 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors"
            >
              Next Question →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.05] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-black/80">{q}</span>
        {open ? <ChevronUp size={14} className="text-black/35 shrink-0" /> : <ChevronDown size={14} className="text-black/35 shrink-0" />}
      </button>
      {open && (
        <p className="pb-4 text-sm text-black/55 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function CertificationsPage() {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  // Simulated current user level — would come from Supabase in production
  const userLevel = "L2";

  return (
    <div className="space-y-10">
      {/* Header / Hero */}
      <div className="panel px-8 py-8"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(252,251,248,0.82) 100%)" }}
      >
        <p className="kicker">BlackCat OS Open Source Certifications</p>
        <h1 className="mt-2 font-header text-3xl leading-tight text-black">
          Study Free. Get Certified. Earn on Dispatch.
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/55 max-w-2xl">
          Five certification levels from Operator to Autonomous Systems Architect. The curriculum is Apache 2.0 open source on GitHub. Pass the TechMedix proctored exam to become dispatch-eligible — then earn on every job.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://github.com/blackcatrobotics/blackcat-os"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#e8601e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors"
          >
            <BookOpen size={14} />
            Study Free on GitHub
            <ExternalLink size={12} />
          </a>
          <a
            href="#quiz"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-black/65 hover:border-[#e8601e] hover:text-[#e8601e] transition-colors"
          >
            Take a Practice Quiz →
          </a>
        </div>
      </div>

      {/* Career Path Timeline */}
      <SurfaceCard title="Certification Path" eyebrow="Career progression">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-0 min-w-[640px]">
            {LEVELS.map((lvl, i) => {
              const isActive = lvl.level === userLevel;
              const isPast = LEVELS.findIndex(l => l.level === userLevel) > i;
              return (
                <div key={lvl.level} className="flex items-start flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => setActiveLevel(activeLevel === lvl.level ? null : lvl.level)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                        isActive
                          ? "bg-[#e8601e] border-[#e8601e] text-white shadow-[0_0_0_4px_rgba(232,96,30,0.2)]"
                          : isPast
                          ? "bg-[#1db87a] border-[#1db87a] text-white"
                          : "bg-black/[0.04] border-black/10 text-black/40 hover:border-[#e8601e]/40"
                      }`}
                    >
                      {isPast ? "✓" : lvl.level}
                    </button>
                    <div className="mt-3 text-center px-1">
                      <p className={`text-xs font-semibold leading-tight ${isActive ? "text-[#e8601e]" : "text-black/70"}`}>
                        {lvl.title}
                      </p>
                      <p className="text-[0.6rem] text-black/35 mt-0.5 uppercase tracking-[0.12em]">{lvl.salary}</p>
                      <p className="text-[0.6rem] text-black/35 uppercase tracking-[0.12em]">{lvl.fee} cert</p>
                    </div>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <div className={`h-0.5 flex-1 mt-6 ${isPast ? "bg-[#1db87a]" : "bg-black/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {activeLevel && (() => {
          const lvl = LEVELS.find(l => l.level === activeLevel)!;
          return (
            <div className="mt-6 rounded-[20px] border border-black/[0.06] bg-black/[0.02] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker">{lvl.level}</p>
                  <h3 className="mt-1 text-lg font-semibold text-black">{lvl.title}</h3>
                  <p className="mt-1 text-sm text-black/55 leading-relaxed max-w-md">{lvl.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-black/40 uppercase tracking-[0.12em] font-ui">One-time fee</p>
                  <p className="text-2xl font-bold text-black">{lvl.fee}</p>
                  <p className="text-xs text-black/40 mt-1">{lvl.jobValue} avg per job</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {lvl.unlocks.map((u) => (
                  <div key={u} className="flex items-center gap-2 text-sm text-black/65">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#1db87a] shrink-0" />
                    {u}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={lvl.curriculum}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-black/60 hover:border-[#e8601e] hover:text-[#e8601e] transition-colors"
                >
                  <BookOpen size={13} />
                  Study {lvl.level} Curriculum
                </a>
                <a
                  href="https://dashboard.blackcatrobotics.com/certifications"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e8601e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors"
                >
                  Start {lvl.title} Exam
                </a>
              </div>
            </div>
          );
        })()}
      </SurfaceCard>

      {/* Level cards */}
      <div>
        <div className="mb-5">
          <p className="kicker">All Levels</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-black">Certification Details</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {LEVELS.map((lvl) => {
            const isUserLevel = lvl.level === userLevel;
            return (
              <div
                key={lvl.level}
                className={`panel-elevated p-6 flex flex-col gap-4 ${isUserLevel ? "ring-2 ring-[#e8601e]/30" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-ui text-[0.62rem] uppercase tracking-[0.22em] text-black/35">{lvl.level}</p>
                    <h3 className="mt-1 font-header text-xl text-black leading-tight">{lvl.title}</h3>
                  </div>
                  {isUserLevel && (
                    <span className="text-[0.58rem] font-ui uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-[#e8601e]/10 text-[#e8601e] border border-[#e8601e]/20">
                      Your level
                    </span>
                  )}
                </div>
                <p className="text-sm text-black/55 leading-relaxed flex-1">{lvl.description}</p>
                <div className="space-y-1.5">
                  {lvl.unlocks.slice(0, 2).map((u) => (
                    <div key={u} className="flex items-center gap-2 text-xs text-black/55">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#1db87a] shrink-0" />
                      {u}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
                  <div>
                    <p className="text-xs text-black/35 uppercase tracking-[0.12em] font-ui">One-time</p>
                    <p className="text-xl font-bold text-black">{lvl.fee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-black/35 uppercase tracking-[0.12em] font-ui">Per job</p>
                    <p className="text-sm font-semibold text-black/70">{lvl.jobValue}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={lvl.curriculum}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-black/55 hover:border-[#e8601e] hover:text-[#e8601e] transition-colors"
                  >
                    <BookOpen size={11} />
                    Study Free
                  </a>
                  <a
                    href="https://dashboard.blackcatrobotics.com/certifications"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#e8601e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#d4521a] transition-colors"
                  >
                    Take Exam
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Modules */}
      <div>
        <div className="mb-5">
          <p className="kicker">Platform Modules</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-black">Hardware-Specific Training</h2>
          <p className="mt-1.5 text-sm text-black/50 max-w-xl">
            Earn specialized platform endorsements alongside your core certification. Required for working on specific robot or drone models.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLATFORM_MODULES.map((mod) => (
            <div key={mod.id} className="panel-elevated overflow-hidden">
              <div className="h-40 overflow-hidden bg-black/[0.04] relative">
                <img
                  src={mod.image}
                  alt={mod.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.10em] backdrop-blur-sm ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                  {mod.special && (
                    <span className="inline-flex items-center rounded-full border border-[#e8601e]/40 bg-[#e8601e]/20 px-2 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.10em] text-white backdrop-blur-sm">
                      ★ {mod.special}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] text-[#e8601e] mb-1">{mod.maker}</p>
                <h3 className="font-header text-lg text-black leading-tight">{mod.name}</h3>
                <p className="mt-1.5 text-xs text-black/50 leading-relaxed">{mod.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-ui text-[0.58rem] uppercase tracking-[0.12em] text-black/30">{mod.difficulty}</span>
                  <a
                    href={mod.studyUrl}
                    className="inline-flex items-center gap-1 text-xs text-[#e8601e] hover:underline"
                  >
                    Study Module →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Quiz */}
      <div id="quiz">
        <div className="mb-5">
          <p className="kicker">Practice Quiz</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-black">Test Your Knowledge</h2>
          <p className="mt-1.5 text-sm text-black/50 max-w-xl">
            Practice questions based on the BlackCat OS curriculum. Select a certification level to begin.
          </p>
        </div>
        <QuizWidget />
      </div>

      {/* How it works */}
      <div className="panel px-8 py-7">
        <p className="kicker mb-5">How It Works</p>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { step: "01", title: "Study Free", detail: "Read the open-source BlackCat OS curriculum on GitHub. Apache 2.0 — free forever." },
            { step: "02", title: "Pass the Exam", detail: "Take the AI-evaluated proctored exam through TechMedix. Instant results and certification." },
            { step: "03", title: "Earn on Dispatch", detail: "Become dispatch-eligible immediately. Accept jobs through the TechMedix platform and get paid." },
          ].map(({ step, title, detail }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="font-header text-4xl text-black/[0.08] leading-none shrink-0">{step}</div>
              <div>
                <h3 className="font-header text-lg text-black">{title}</h3>
                <p className="mt-1 text-sm text-black/55 leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <SurfaceCard title="Frequently Asked Questions" eyebrow="FAQ">
        <div>
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </SurfaceCard>

      {/* Info banner */}
      <div className="panel px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">BlackCat OS Curriculum</p>
          <p className="mt-1 text-sm text-black/55 max-w-xl leading-relaxed">
            Apache 2.0 open source. Community-maintained. Free to study, fork, and contribute.
          </p>
        </div>
        <a
          href="https://github.com/blackcatrobotics/blackcat-os"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-black/90 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors shrink-0"
        >
          View on GitHub
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
