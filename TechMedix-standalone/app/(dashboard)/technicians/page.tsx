import { createSupabaseServerClient } from "../../../lib/supabase-server";
import type { Certification } from "../../../types/atlas";
import { CheckCircle2, Circle, Award } from "lucide-react";
import { BcrCertSection } from "./BcrCertSection";

export const revalidate = 60;

const LEVEL_COLORS = [
  { border: "border-zinc-200",   badge: "bg-zinc-600"   },
  { border: "border-sky-200",    badge: "bg-sky-600"    },
  { border: "border-violet-200", badge: "bg-violet-600" },
  { border: "border-amber-200",  badge: "bg-amber-600"  },
  { border: "border-rose-200",   badge: "bg-rose-600"   },
];

function techLevel(rating: number): number {
  if (rating >= 4.8) return 5;
  if (rating >= 4.5) return 4;
  if (rating >= 4.0) return 3;
  if (rating >= 3.5) return 2;
  return 1;
}

export default async function TechniciansPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: techs }, { data: jobs }, { data: certs }, { data: techCerts }] =
    await Promise.all([
      supabase.from("technicians").select("*").order("name"),
      supabase.from("dispatch_jobs").select("technician_id, status"),
      supabase.from("certifications").select("*").order("level"),
      supabase.from("technician_certifications").select("certification_id, ai_score, earned_at"),
    ]);

  const techList = (techs ?? []) as Array<{
    id: string;
    name: string;
    region: string;
    available: boolean;
    platforms: string[];
    rating: number;
    eta_minutes: number;
  }>;
  const jobList = (jobs ?? []) as Array<{ technician_id: string; status: string }>;
  const certList = (certs ?? []) as Certification[];
  const earnedIds = new Set((techCerts ?? []).map((tc) => tc.certification_id));
  const scoreMap: Record<string, number> = {};
  for (const tc of techCerts ?? []) {
    if (tc.ai_score != null) scoreMap[tc.certification_id] = tc.ai_score;
  }

  const earned = certList.filter((c) => earnedIds.has(c.id)).length;

  return (
    <div className="space-y-12">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <p className="kicker">Field Operations</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-[var(--ink)] lg:text-5xl">
          Technicians & Certifications
        </h1>
      </div>

      {/* ── Summary stats ───────────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel px-5 py-4">
          <p className="kicker">Total Technicians</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
            {techList.length}
          </p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Available</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-moss">
            {techList.filter((t) => t.available).length}
          </p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">On Active Jobs</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-ember">
            {techList.filter((t) => !t.available).length}
          </p>
        </div>
      </section>

      {/* ── Technician cards ────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5">
          <h2 className="font-header text-2xl leading-tight text-[var(--ink)]">Technician Roster</h2>
        </div>

        {techList.length === 0 ? (
          <p className="text-sm text-[var(--ink)]/40 py-8 text-center">No technicians found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techList.map((tech) => {
              const level = techLevel(tech.rating ?? 3.0);
              const colors = LEVEL_COLORS[level - 1] ?? LEVEL_COLORS[0];
              const activeJobs = jobList.filter(
                (j) => j.technician_id === tech.id &&
                  j.status !== "completed" && j.status !== "cancelled"
              ).length;
              const completedJobs = jobList.filter(
                (j) => j.technician_id === tech.id && j.status === "completed"
              ).length;

              return (
                <div key={tech.id} className={`panel px-5 py-5 flex flex-col gap-3 border ${colors.border}`}>
                  {/* Name + level badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember/10 text-sm font-semibold text-ember">
                        {tech.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--ink)] leading-tight">{tech.name}</h3>
                        <p className="text-xs text-[var(--ink)]/50">{tech.region}</p>
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-header text-sm shrink-0 ${colors.badge}`}
                      title={`Level ${level}`}
                    >
                      {level}
                    </div>
                  </div>

                  {/* Job counts + rating */}
                  <div className="flex gap-4">
                    <div>
                      <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">Active</p>
                      <p className="font-semibold text-sm text-ember mt-0.5">{activeJobs}</p>
                    </div>
                    <div>
                      <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">Completed</p>
                      <p className="font-semibold text-sm text-moss mt-0.5">{completedJobs}</p>
                    </div>
                    <div>
                      <p className="font-ui text-[0.55rem] uppercase tracking-[0.14em] text-[var(--ink)]/40">Rating</p>
                      <p className="font-semibold text-sm text-[var(--ink)] mt-0.5">{tech.rating?.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Platform tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(tech.platforms ?? []).map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-[var(--ink)]/8 bg-[var(--ink)]/[0.03] px-2.5 py-0.5 text-[0.58rem] text-[var(--ink)]/50 uppercase tracking-[0.10em]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Status + ETA */}
                  <div className="mt-auto pt-2 border-t border-[var(--ink)]/[0.05] flex items-center justify-between">
                    <span className={`text-xs font-medium ${tech.available ? "text-moss" : "text-ember"}`}>
                      {tech.available ? "Available" : "Busy"}
                    </span>
                    <span className="text-xs text-[var(--ink)]/35">ETA {tech.eta_minutes} min</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── BCR Field Tech Certifications (client — interactive checklist) ─── */}
      <BcrCertSection />

      {/* ── Certification Levels from Supabase ──────────────────────────────── */}
      {certList.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker">Technician Program</p>
              <h2 className="mt-0.5 font-header text-2xl leading-tight text-[var(--ink)]">Certification Levels</h2>
            </div>
            <div className="panel px-4 py-3 flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-zinc-500">Earned</p>
                <p className="font-header text-lg text-[var(--ink)] tracking-tight">
                  {earned} / {certList.length}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {certList.map((cert) => {
              const idx = Math.min(cert.level - 1, LEVEL_COLORS.length - 1);
              const colors = LEVEL_COLORS[idx];
              const isEarned = earnedIds.has(cert.id);
              const aiScore = scoreMap[cert.id];
              const modules = cert.modules_required as string[];

              return (
                <div
                  key={cert.id}
                  className={`panel px-6 py-5 border ${colors.border} ${isEarned ? "opacity-100" : "opacity-90"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.badge} text-white font-header text-lg`}
                      >
                        {cert.level}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm text-[var(--ink)] leading-tight">{cert.name}</h3>
                          {isEarned && (
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Earned
                            </span>
                          )}
                        </div>
                        {cert.description && (
                          <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">{cert.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-6 flex-wrap text-center">
                      <div>
                        <p className="text-lg font-header text-[var(--ink)] tracking-tight">{cert.simulations_required}</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Simulations</p>
                      </div>
                      <div>
                        <p className="text-lg font-header text-[var(--ink)] tracking-tight">{cert.real_repairs_required}</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Real Repairs</p>
                      </div>
                      <div>
                        <p className="text-lg font-header text-[var(--ink)] tracking-tight">{cert.ai_score_threshold}%</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide">AI Score Min</p>
                      </div>
                    </div>
                  </div>

                  {/* Modules checklist */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {modules.map((mod, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {isEarned ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
                        )}
                        <span className={isEarned ? "text-zinc-600" : "text-zinc-400"}>{mod}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI score progress */}
                  {aiScore != null && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                        <span>AI Score</span>
                        <span className="font-medium text-[var(--ink)]">{aiScore}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--ink)]/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors.badge} transition-all`}
                          style={{ width: `${Math.min(100, aiScore)}%` }}
                        />
                      </div>
                      <div
                        className="h-1.5 relative -mt-1.5 pointer-events-none"
                        style={{ paddingLeft: `${cert.ai_score_threshold}%` }}
                      >
                        <div
                          className="w-px h-2 bg-black/20 absolute"
                          style={{ left: `${cert.ai_score_threshold}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
