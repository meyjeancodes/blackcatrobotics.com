import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CERT_LEVELS } from "@/lib/cert-levels";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Certifications | TechMedix Knowledge",
};

export default async function DashboardCertificationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user's existing certifications if logged in
  const { data: earned } = user
    ? await supabase
        .from("certifications")
        .select("level, issued_at")
        .eq("user_id", user.id)
    : { data: [] };

  const earnedSet = new Set((earned ?? []).map((c: { level: string }) => c.level));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-ui text-[0.62rem] uppercase tracking-[0.38em] text-white/30 mb-1">
          TechMedix Training
        </p>
        <h1 className="font-header text-2xl text-white">BCR Field Tech Certifications</h1>
        <p className="text-white/40 text-sm mt-1 max-w-xl">
          Five levels from entry Operator to Autonomous Systems Architect.
          Each certification unlocks higher-value dispatch jobs and greater platform eligibility
          in the BCR technician network.
        </p>
      </div>

      {/* Cert level list */}
      <div className="space-y-3">
        {CERT_LEVELS.map((level) => {
          const isEarned = earnedSet.has(level.id);
          return (
            <div
              key={level.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <div className="flex items-start gap-4 flex-wrap">
                {/* Badge */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-header text-lg font-bold text-white ${level.badgeColor}`}>
                  {level.id}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="font-header text-lg text-white leading-tight">
                      {level.id} — {level.title}
                    </h2>
                    {isEarned && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 font-ui text-[0.55rem] uppercase tracking-[0.14em]">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className={`font-mono text-sm font-semibold mb-1 ${level.color}`}>
                    {level.jobValueRange}
                  </p>
                  <p className="text-white/30 text-xs mb-3">{level.prerequisites}</p>

                  {/* Competencies */}
                  <div className="grid sm:grid-cols-2 gap-1.5 mb-4">
                    {level.competencies.map((c) => (
                      <div key={c} className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-white/20 shrink-0" />
                        <p className="text-white/50 text-xs leading-relaxed">{c}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/knowledge/study-guides?level=${level.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-white/50 hover:text-white hover:border-white/25 transition-colors"
                    >
                      Study Guide
                    </Link>
                    <Link
                      href={`/knowledge/modules`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-white/50 hover:text-white hover:border-white/25 transition-colors"
                    >
                      Training Modules
                    </Link>
                    {!isEarned && (
                      <Link
                        href={`/certifications/${level.id}/exam`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-white hover:bg-ember/80 transition-colors"
                      >
                        Take Exam
                        <ChevronRight size={11} />
                      </Link>
                    )}
                    {isEarned && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-green-400">
                        Certified
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="font-header text-xl text-white">{level.price}</p>
                  <p className="font-ui text-[0.55rem] uppercase tracking-widest text-white/25">one-time</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note about exams */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <p className="text-white/30 text-xs leading-relaxed">
          Exams are proctored and scored automatically. Passing score is 80% or above.
          Study guides and training modules are available above before you attempt any exam.
          Certification is issued immediately upon passing and recorded to your technician profile.
        </p>
      </div>
    </div>
  );
}
