import { createSupabaseServerClient } from "../../../lib/supabase-server";
import type { Certification } from "../../../types/atlas";
import { CheckCircle2, Circle, Award } from "lucide-react";

export const revalidate = 60;

const LEVEL_COLORS = [
  { bg: "bg-zinc-100", text: "text-zinc-600", border: "border-zinc-200", badge: "bg-zinc-600" },
  { bg: "bg-sky-50",   text: "text-sky-700",  border: "border-sky-200",  badge: "bg-sky-600"  },
  { bg: "bg-violet-50",text: "text-violet-700",border: "border-violet-200",badge: "bg-violet-600"},
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-600"},
  { bg: "bg-rose-50",  text: "text-rose-700",  border: "border-rose-200",  badge: "bg-rose-600" },
];

export default async function CertificationsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: certs } = await supabase
    .from("certifications")
    .select("*")
    .order("level");

  const { data: techCerts } = await supabase
    .from("technician_certifications")
    .select("certification_id, ai_score, earned_at");

  const earnedIds = new Set((techCerts ?? []).map((tc) => tc.certification_id));
  const scoreMap: Record<string, number> = {};
  for (const tc of techCerts ?? []) {
    if (tc.ai_score != null) scoreMap[tc.certification_id] = tc.ai_score;
  }

  const certList = (certs ?? []) as Certification[];

  const earned = certList.filter((c) => earnedIds.has(c.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Technician Program</p>
          <h1 className="font-header text-2xl tracking-[-0.03em] text-black mt-0.5">
            Certifications
          </h1>
        </div>
        <div className="panel px-4 py-3 flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs text-zinc-500">Earned</p>
            <p className="font-header text-lg text-black tracking-tight">
              {earned} / {certList.length}
            </p>
          </div>
        </div>
      </div>

      {/* Level cards */}
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
                  {/* Level badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.badge} text-white font-header text-lg`}
                  >
                    {cert.level}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-black leading-tight">
                        {cert.name}
                      </h3>
                      {isEarned && (
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Earned
                        </span>
                      )}
                    </div>
                    {cert.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                        {cert.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Requirements summary */}
                <div className="flex gap-6 flex-wrap text-center">
                  <div>
                    <p className="text-lg font-header text-black tracking-tight">
                      {cert.simulations_required}
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
                      Simulations
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-header text-black tracking-tight">
                      {cert.real_repairs_required}
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
                      Real Repairs
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-header text-black tracking-tight">
                      {cert.ai_score_threshold}%
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
                      AI Score Min
                    </p>
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
                    <span className={isEarned ? "text-zinc-600" : "text-zinc-400"}>
                      {mod}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI score progress bar */}
              {aiScore != null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                    <span>AI Score</span>
                    <span className="font-medium text-black">{aiScore}%</span>
                  </div>
                  <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors.badge} transition-all`}
                      style={{ width: `${Math.min(100, aiScore)}%` }}
                    />
                  </div>
                  <div
                    className="h-1.5 relative -mt-1.5 pointer-events-none"
                    style={{ paddingLeft: `${cert.ai_score_threshold}%` }}
                  >
                    <div className="w-px h-2 bg-black/20 absolute"
                      style={{ left: `${cert.ai_score_threshold}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
