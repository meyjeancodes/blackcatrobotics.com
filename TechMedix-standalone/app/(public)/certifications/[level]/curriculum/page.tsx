import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, FileText, FlaskConical, ClipboardCheck } from "lucide-react";
import { CERT_LEVELS } from "../../../../../lib/cert-levels";
import { loadCertSections } from "../../../../../lib/cert-content";
import { PrintButton } from "../../../../../components/print-button";

interface Props {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ section?: string }>;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  README: BookOpen,
  curriculum: FileText,
  lab_exercises: FlaskConical,
  competency_rubric: ClipboardCheck,
};

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
    title: `${cert.id} ${cert.title} — Study Guide | TechMedix`,
    description: `Full BCR ${cert.id} ${cert.title} study guide — curriculum, lab exercises, and competency rubric.`,
  };
}

export default async function CurriculumPage({ params, searchParams }: Props) {
  const { level } = await params;
  const { section } = await searchParams;
  const cert = CERT_LEVELS.find((c) => c.id === level);
  if (!cert) notFound();
  const sections = loadCertSections(level);
  if (!sections || sections.length === 0) notFound();

  const active = sections.find((s) => s.key === section) ?? sections[0];

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          nav, header .no-print, .no-print { display: none !important; }
          .cert-prose { box-shadow: none !important; border: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="no-print flex items-center gap-1.5 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-theme-40">
          <Link href="/certifications" className="transition hover:text-theme-primary">
            Certifications
          </Link>
          <ChevronRight size={10} />
          <Link href={`/certifications/${cert.id}`} className="transition hover:text-theme-primary">
            {cert.id}
          </Link>
          <ChevronRight size={10} />
          <span className="text-theme-70">Study Guide</span>
        </nav>

        {/* Header */}
        <header className="no-print flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="kicker">{cert.id} · {cert.title}</p>
            <h1 className="font-header text-3xl text-theme-primary">Study Guide</h1>
            <p className="text-sm text-theme-45 max-w-2xl">
              Complete study material for the {cert.id} exam — read through each section,
              complete the lab exercises, and review the competency rubric before testing.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <PrintButton label="Save as PDF" />
            <Link
              href={`/certifications/${cert.id}/exam`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90 ${cert.badgeColor}`}
            >
              Take Exam
              <ChevronRight size={11} />
            </Link>
          </div>
        </header>

        {/* Section tabs */}
        <div className="no-print flex flex-wrap gap-2 border-b border-theme-12 pb-3">
          {sections.map((s) => {
            const isActive = s.key === active.key;
            const Icon = SECTION_ICONS[s.key] ?? BookOpen;
            return (
              <Link
                key={s.key}
                href={`/certifications/${cert.id}/curriculum?section=${s.key}`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold transition ${
                  isActive
                    ? `text-white ${cert.badgeColor}`
                    : "border border-theme-12 text-theme-60 hover:bg-theme-4 hover:text-theme-primary"
                }`}
              >
                <Icon size={11} />
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Active section label */}
        <div className="no-print flex items-center gap-3">
          {(() => {
            const Icon = SECTION_ICONS[active.key] ?? BookOpen;
            return (
              <>
                <div className={`rounded-xl p-2 ${cert.badgeColor} bg-opacity-10`}>
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="font-ui text-[0.55rem] uppercase tracking-[0.18em] text-theme-35">{cert.id} · {cert.title}</p>
                  <p className="font-header text-base text-theme-primary">{active.label}</p>
                </div>
              </>
            );
          })()}
        </div>

        {/* Content — rendered live on page */}
        <article
          className="cert-prose panel p-8 lg:p-10"
          dangerouslySetInnerHTML={{ __html: active.html }}
        />

        {/* Footer nav */}
        <div className="no-print flex items-center justify-between gap-4 border-t border-theme-12 pt-6">
          <Link
            href={`/certifications/${cert.id}`}
            className="inline-flex items-center gap-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-theme-60 transition hover:text-theme-primary"
          >
            <ChevronRight size={11} className="rotate-180" />
            Back to {cert.id} overview
          </Link>
          <div className="flex items-center gap-3">
            <PrintButton />
            <Link
              href={`/certifications/${cert.id}/exam`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-ui text-[0.60rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:opacity-90 ${cert.badgeColor}`}
            >
              Take the {cert.id} Exam
              <ChevronRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
