import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CERT_LEVELS } from "@/lib/cert-levels";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Certifications | TechMedix Knowledge",
};

export default async function DashboardCertificationsPage() {
  let user = null;
  let earned: { level: string }[] = [];

  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user: u } } = await supabase.auth.getUser();
      user = u;
      if (user) {
        const { data } = await supabase
          .from("certifications")
          .select("level, issued_at")
          .eq("user_id", user.id);
        earned = data ?? [];
      }
    }
  } catch {
    // Auth/DB offline — render without user state
  }

  const earnedSet = new Set(earned.map((c) => c.level));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="kicker">TechMedix Training</p>
        <h1 className="mt-2 font-header text-3xl leading-tight text-theme-primary">
          BCR Field Tech Certifications
        </h1>
        <p className="mt-2 text-sm text-theme-55 max-w-xl">
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
              className="panel-elevated p-5"
            >
              <div className="flex items-start gap-4 flex-wrap">
                {/* Badge */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-header text-lg font-bold text-white ${level.badgeColor}`}>
                  {level.id}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="font-header text-lg text-theme-primary leading-tight">
                      {level.id} — {level.title}
                    </h2>
                    {isEarned && (
                      <span className="inline-flex items-center rounded-full bg-moss/10 border border-moss/20 text-moss font-ui text-[0.55rem] uppercase tracking-[0.14em] px-2 py-0.5">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className={`font-mono text-sm font-semibold mb-1 ${level.color}`}>
                    {level.jobValueRange}
                  </p>
                  <p className="text-theme-40 text-xs mb-3">{level.prerequisites}</p>

                  {/* Competencies */}
                  <div className="grid sm:grid-cols-2 gap-1.5 mb-4">
                    {level.competencies.map((c) => (
                      <div key={c} className="flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-theme-25 shrink-0" />
                        <p className="text-theme-50 text-xs leading-relaxed">{c}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/knowledge/study-guides?level=${level.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-50 hover:text-theme-primary hover:border-theme-20 transition-colors"
                    >
                      Study Guide
                    </Link>
                    <Link
                      href={`/knowledge/modules`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-50 hover:text-theme-primary hover:border-theme-20 transition-colors"
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 border border-moss/20 px-4 py-1.5 font-ui text-[0.60rem] uppercase tracking-[0.16em] text-moss">
                        Certified
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="font-header text-xl text-theme-primary">{level.price}</p>
                  <p className="font-ui text-[0.55rem] uppercase tracking-widest text-theme-30">one-time</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note about exams */}
      <div className="panel px-5 py-4">
        <p className="text-theme-40 text-xs leading-relaxed">
          Exams are proctored and scored automatically. Passing score is 80% or above.
          Study guides and training modules are available above before you attempt any exam.
          Certification is issued immediately upon passing and recorded to your technician profile.
        </p>
      </div>
    </div>
  );
}
