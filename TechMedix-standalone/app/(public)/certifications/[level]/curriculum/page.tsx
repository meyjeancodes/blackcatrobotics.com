import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CERT_LEVELS } from "../../../../../lib/cert-levels";
import { loadCertSections } from "../../../../../lib/cert-content";

interface Props {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ section?: string }>;
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
    title: `${cert.id} ${cert.title} — Curriculum | TechMedix`,
    description: `Full BCR ${cert.id} ${cert.title} curriculum, lab exercises, and competency rubric.`,
  };
}

export default async function CurriculumPage({ params, searchParams }: Props) {
  const { level } = await params;
  const { section } = await searchParams;
  const cert = CERT_LEVELS.find((c) => c.id === level);
  if (!cert) notFound();
  const sections = loadCertSections(level);
  if (!sections || sections.length === 0) notFound();

  const active =
    sections.find((s) => s.key === section) ?? sections[0];

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-1.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-40">
        <Link href="/certifications" className="transition hover:text-theme-primary">
          Certifications
        </Link>
        <ChevronRight size={10} />
        <Link href={`/certifications/${cert.id}`} className="transition hover:text-theme-primary">
          {cert.id}
        </Link>
        <ChevronRight size={10} />
        <span className="text-theme-70">Curriculum</span>
      </nav>

      <header className="space-y-2">
        <p className="kicker">{cert.id} · {cert.title}</p>
        <h1 className="font-header text-3xl text-theme-primary">Full Curriculum</h1>
        <p className="text-sm text-theme-45 max-w-2xl">
          Everything covered on the {cert.id} exam — study material, lab
          exercises, and the competency rubric used by instructors.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-theme-12 pb-3">
        {sections.map((s) => {
          const isActive = s.key === active.key;
          return (
            <Link
              key={s.key}
              href={`/certifications/${cert.id}/curriculum?section=${s.key}`}
              className={`rounded-full px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold transition ${
                isActive
                  ? `text-white ${cert.badgeColor}`
                  : "border border-theme-12 text-theme-60 hover:bg-theme-4 hover:text-theme-primary"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      <article
        className="cert-prose panel p-8"
        dangerouslySetInnerHTML={{ __html: active.html }}
      />

      <div className="flex items-center justify-between gap-4 border-t border-theme-12 pt-6">
        <Link
          href={`/certifications/${cert.id}`}
          className="inline-flex items-center gap-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-theme-60 transition hover:text-theme-primary"
        >
          <ChevronRight size={11} className="rotate-180" />
          Back to {cert.id} overview
        </Link>
        <Link
          href={`/certifications/${cert.id}/exam`}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90 ${cert.badgeColor}`}
        >
          Take the {cert.id} Exam
          <ChevronRight size={11} />
        </Link>
      </div>
    </div>
  );
}
