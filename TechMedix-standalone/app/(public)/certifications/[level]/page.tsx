import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, Lock, DollarSign } from "lucide-react";
import { CERT_LEVELS } from "../../../../lib/cert-levels";

interface Props {
  params: Promise<{ level: string }>;
}

export function generateStaticParams() {
  return [
    { level: "L1" },
    { level: "L2" },
    { level: "L3" },
    { level: "L4" },
    { level: "L5" },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { level } = await params;
  const cert = CERT_LEVELS.find((c) => c.id === level);
  if (!cert) return {};
  return {
    title: `${cert.id} ${cert.title} Certification | TechMedix`,
    description: `BCR ${cert.id} — ${cert.title}. ${cert.jobValueRange}. ${cert.prerequisites}.`,
  };
}

export default async function CertLevelPage({ params }: Props) {
  const { level } = await params;
  if (!CERT_LEVELS.find((c) => c.id === level)) notFound();
  const cert = CERT_LEVELS.find((c) => c.id === level)!;

  const levelIndex = CERT_LEVELS.indexOf(cert);
  const prev = levelIndex > 0 ? CERT_LEVELS[levelIndex - 1] : null;
  const next = levelIndex < CERT_LEVELS.length - 1 ? CERT_LEVELS[levelIndex + 1] : null;

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-40">
        <Link href="/certifications" className="transition hover:text-theme-primary">
          Certifications
        </Link>
        <ChevronRight size={10} />
        <span className="text-theme-70">{cert.id}</span>
      </nav>

      {/* Header */}
      <div className={`panel-elevated border p-8 ${cert.borderColor}`}>
        <div className="flex flex-wrap items-start gap-6">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl font-header text-2xl font-bold text-white ${cert.badgeColor}`}
          >
            {cert.id}
          </div>
          <div className="min-w-0 flex-1">
            <p className="kicker">Level {levelIndex + 1} of 5</p>
            <h1 className="mt-1 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary">
              {cert.title}
            </h1>
            <p className={`mt-2 font-mono text-lg font-semibold ${cert.color}`}>
              {cert.jobValueRange}
            </p>
            <p className="mt-1 font-ui text-[0.60rem] uppercase tracking-[0.14em] text-theme-40">
              {cert.price} one-time certification fee
            </p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Covers + competencies */}
        <div className="panel p-6 space-y-6">
          <div>
            <p className="kicker">Covers</p>
            <ul className="mt-3 space-y-2">
              {cert.covers.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-theme-65 leading-snug">
                  <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cert.badgeColor}`} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker">Key Competencies</p>
            <h2 className="mt-1 font-header text-xl text-theme-primary">What you will learn</h2>
            <ul className="mt-3 space-y-3">
              {cert.competencies.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-theme-65 leading-snug">
                  <div
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cert.badgeColor}`}
                  />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prerequisites + price + resources */}
        <div className="space-y-4">
          <div className="panel p-6 space-y-3">
            <p className="kicker">Prerequisites</p>
            <div className="flex items-start gap-3">
              <Lock size={14} className="mt-0.5 shrink-0 text-theme-30" />
              <p className="text-sm text-theme-65 leading-snug">{cert.prerequisites}</p>
            </div>
          </div>

          <div className="panel p-6 space-y-3">
            <p className="kicker">Certification Fee</p>
            <div className="flex items-center gap-3">
              <DollarSign size={14} className="shrink-0 text-theme-40" />
              <div>
                <p className="text-sm font-semibold text-theme-primary">
                  {cert.price}{" "}
                  <span className="font-normal text-theme-40">one-time</span>
                </p>
              </div>
            </div>
            <Link
              href="/certifications"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90 ${cert.badgeColor}`}
            >
              Start {cert.id} Certification
              <ChevronRight size={11} />
            </Link>
          </div>

          <div className="panel p-6 space-y-3">
            <p className="kicker">Study Resources</p>
            <a
              href={cert.studyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-theme-12 px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-theme-60 transition hover:bg-theme-4 hover:text-theme-primary"
            >
              <BookOpen size={12} />
              Open Curriculum on GitHub
            </a>
            <p className="text-xs text-theme-40 leading-relaxed">
              Review the README and curriculum.md before attempting the exam.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="panel-elevated p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kicker">Ready to test?</p>
          <h2 className="mt-1 font-header text-2xl text-theme-primary">Take the {cert.id} Exam</h2>
          <p className="mt-1 text-sm text-theme-45">
            5 questions · Passing score varies by level · Results emailed instantly
          </p>
        </div>
        <Link
          href={`/certifications/${cert.id}/exam`}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90 ${cert.badgeColor}`}
        >
          Start Exam
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* Level nav */}
      <div className="flex items-center justify-between gap-4 border-t border-theme-6 pt-6">
        {prev ? (
          <Link
            href={`/certifications/${prev.id}`}
            className="text-sm text-theme-45 transition hover:text-theme-primary"
          >
            ← {prev.id} {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/certifications/${next.id}`}
            className="text-sm text-theme-45 transition hover:text-theme-primary"
          >
            {next.id} {next.title} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
