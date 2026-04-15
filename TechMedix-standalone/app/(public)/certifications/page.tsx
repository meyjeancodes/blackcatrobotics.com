import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CERT_LEVELS } from "../../../lib/cert-levels";

export const metadata = {
  title: "BCR Certification Program | TechMedix",
  description:
    "Enroll in the BCR Field Tech Certification program. Five levels from entry Operator to Autonomous Architect.",
};

export default function CertificationsIndexPage() {
  return (
    <div className="space-y-10">
      <div>
        <p className="kicker">Certification Program</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          BCR Field Tech Certifications
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          Choose your certification level. Each level builds on the last — unlocking higher-value
          dispatch jobs, more platform eligibility, and greater autonomy within the BCR technician
          network.
        </p>
      </div>

      <div className="space-y-3">
        {CERT_LEVELS.map((level) => (
          <Link
            key={level.id}
            href={`/certifications/${level.id}`}
            className={[
              "panel-elevated flex items-center gap-4 border p-5 transition hover:shadow-md",
              level.borderColor,
            ].join(" ")}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-header text-lg font-bold text-white ${level.badgeColor}`}
            >
              {level.id}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-header text-lg leading-tight text-theme-primary">
                {level.id} — {level.title}
              </h2>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-3">
                <p className={`font-mono text-sm font-semibold ${level.color}`}>
                  {level.jobValueRange}
                </p>
                <p className="font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-40">
                  {level.price} one-time
                </p>
              </div>
              <p className="mt-1 text-xs text-theme-40">{level.prerequisites}</p>
            </div>
            <ChevronRight className="shrink-0 text-theme-25" size={18} />
          </Link>
        ))}
      </div>

      <div className="panel space-y-3 p-6 text-center">
        <p className="text-sm text-theme-55">Already certified? Sign in to track your progress.</p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-full border border-theme-12 px-5 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-theme-60 transition hover:bg-theme-4"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
