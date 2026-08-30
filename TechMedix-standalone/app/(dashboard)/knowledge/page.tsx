import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  ChevronRight,
  GraduationCap,
  Search,
  Shield,
  Wrench,
} from "lucide-react";
import { getPlatformsFromSupabase } from "@/lib/knowledge/platforms-server";
import { PlatformSearch } from "@/components/platform-search";
import { SymptomFinder } from "./symptom-finder";

// ─── Supporting areas ────────────────────────────────────────────────────────

const SUPPORTING = [
  {
    title: "Certifications",
    description: "Five levels from Operator to Autonomous Systems Architect.",
    href: "/technicians/certifications",
    icon: GraduationCap,
    color: "text-violet-600",
    bg: "bg-violet-500/[0.08]",
  },
];

// ─── Repair loop steps ───────────────────────────────────────────────────────

const REPAIR_LOOP = [
  {
    step: "1",
    title: "Something is wrong",
    description: "A robot is down. You have a symptom, an error code, or a hunch.",
    icon: AlertTriangle,
    color: "text-red-500",
  },
  {
    step: "2",
    title: "Identify the robot",
    description: "Find your platform. Browse by manufacturer, category, or search.",
    icon: Bot,
    color: "text-violet-500",
  },
  {
    step: "3",
    title: "Find the failure",
    description: "Match the symptom to a documented failure mode. Severity, MTBF, confidence.",
    icon: Search,
    color: "text-sky-500",
  },
  {
    step: "4",
    title: "Get the procedure",
    description: "Step-by-step repair protocol. Tools, parts, skill level, time estimate.",
    icon: Wrench,
    color: "text-amber-500",
  },
  {
    step: "5",
    title: "Record the repair",
    description: "Log the fix. Track fleet health. Build institutional knowledge.",
    icon: Shield,
    color: "text-emerald-500",
  },
];

export default async function KnowledgePage() {
  const platforms = await getPlatformsFromSupabase();
  const totalPlatforms = platforms.length;
  const totalFailureModes = platforms.reduce(
    (sum, p) => sum + p.failureSignatures.length,
    0
  );

  // Build symptom finder data from platforms (which include failure signatures)
  const symptomFinderData = platforms.map((p) => ({
    id: p.id,
    symptom: p.name,
    root_cause: p.description,
    component: p.category,
    severity: "medium" as const,
    tags: p.failureSignatures.map((fs) => fs.name),
    platform_name: p.name,
    platform_slug: p.id,
  }));

  return (
    <div className="space-y-8">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div>
        <p className="kicker">Repair Intelligence</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Knowledge Hub
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink)]/52">
          The operator console for robot repair. Identify the robot, diagnose the
          failure, follow the procedure, record the fix.
        </p>
      </div>

      {/* ── Repair Loop Visual ────────────────────────────────────────────── */}
      <section className="rounded-[28px] border border-[var(--ink)]/[0.06] bg-[var(--ink)]/[0.02] p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="font-header text-xl leading-tight text-[var(--ink)]">
            The Repair Loop
          </h2>
          <p className="mt-1 text-sm text-[var(--ink)]/50">
            The workflow every operator follows. The Knowledge Hub is optimized for this path.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {REPAIR_LOOP.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex flex-col">
                {i < REPAIR_LOOP.length - 1 && (
                  <div className="absolute right-0 top-6 hidden h-px w-4 translate-x-full bg-[var(--ink)]/10 lg:block" />
                )}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)]/[0.04] ring-1 ring-[var(--ink)]/[0.08]">
                    <Icon size={14} className={item.color} />
                  </div>
                  <span className="font-ui text-[0.50rem] uppercase tracking-[0.18em] text-[var(--ink)]/30">
                    Step {item.step}
                  </span>
                </div>
                <h3 className="font-header text-sm leading-tight text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink)]/45">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Entry Points ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-header text-xl leading-tight text-[var(--ink)] mb-4">
          Start Here
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="#platform-search"
            className="group panel-elevated flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/[0.10] ring-1 ring-violet-500/20">
              <Bot size={20} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-header text-base leading-tight text-[var(--ink)] group-hover:text-violet-600 transition">
                I know my robot
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink)]/45">
                Browse by platform. {totalPlatforms} robots, {totalFailureModes} documented failure modes.
              </p>
            </div>
            <ChevronRight size={14} className="text-[var(--ink)]/20 group-hover:text-violet-600 transition" />
          </Link>
          <Link
            href="#platform-search"
            className="group panel-elevated flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/[0.10] ring-1 ring-sky-500/20">
              <Search size={20} className="text-sky-600" />
            </div>
            <div>
              <h3 className="font-header text-base leading-tight text-[var(--ink)] group-hover:text-sky-600 transition">
                I know my symptom
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink)]/45">
                Search failures across all platforms. Filter by severity, component, confidence.
              </p>
            </div>
            <ChevronRight size={14} className="text-[var(--ink)]/20 group-hover:text-sky-600 transition" />
          </Link>
          <Link
            href="#platform-search"
            className="group panel-elevated flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/[0.10] ring-1 ring-emerald-500/20">
              <GraduationCap size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-header text-base leading-tight text-[var(--ink)] group-hover:text-emerald-600 transition">
                I want to learn
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink)]/45">
                Explore platforms by category. Find your robot and start learning.
              </p>
            </div>
            <ChevronRight size={14} className="text-[var(--ink)]/20 group-hover:text-emerald-600 transition" />
          </Link>
        </div>
      </section>

      {/* ── Diagnostic Symptom Finder ─────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <p className="kicker">Level 1 — Diagnose</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-[var(--ink)]">
            Find Your Failure
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            Describe a symptom — we'll match it to documented failure modes and repair protocols.
          </p>
        </div>
        <SymptomFinder failureModes={symptomFinderData as any} />
      </section>

      {/* ── Platform Search (Level 2) ─────────────────────────────────────── */}
      <section id="platform-search">
        <div className="mb-4">
          <p className="kicker">Level 2 — Physical</p>
          <h2 className="mt-1.5 font-header text-2xl leading-tight text-[var(--ink)]">
            Robot Platform Catalog
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]/50 max-w-xl">
            Specs, failure signatures, and interactive diagrams for every supported platform.
          </p>
        </div>
        <PlatformSearch platforms={platforms} />
      </section>

      {/* ── Supporting Areas ──────────────────────────────────────────────── */}
      <section>
        <h2 className="font-header text-xl leading-tight text-[var(--ink)] mb-4">
          Supporting Areas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SUPPORTING.map((area) => {
            const Icon = area.icon;
            return (
              <Link
                key={area.href}
                href={area.href}
                className="group panel-elevated flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`shrink-0 rounded-xl ${area.bg} p-3`}>
                  <Icon size={20} className={area.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-header text-base leading-tight text-[var(--ink)] group-hover:text-ember transition">
                    {area.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--ink)]/45">
                    {area.description}
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-[var(--ink)]/20 group-hover:text-ember transition" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
