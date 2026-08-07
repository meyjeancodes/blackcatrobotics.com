import Link from "next/link";
import { notFound } from "next/navigation";
import ALL_PLATFORMS, { PLATFORM_IMAGE_MAP } from "@/lib/platforms";

export function generateStaticParams() {
  return ALL_PLATFORMS.filter(
    (p: any) => p.category && p.description && p.failureSignatures
  ).map((p: any) => ({ platform: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = (ALL_PLATFORMS as any[]).find((x) => x.id === platform);
  if (!p) return {};
  const url = `https://blackcatrobotics.com/insights/${p.id}`;
  return {
    title: `${p.name} Predictive Maintenance & Failure Modes | TechMedix`,
    description: `Common failure modes for the ${p.name} by ${p.manufacturer}, and how TechMedix predicts them before breakdown. ${p.description}`,
    alternates: { canonical: url },
    openGraph: {
      title: `${p.name} Predictive Maintenance & Failure Modes | TechMedix`,
      description: `Failure modes for the ${p.name} by ${p.manufacturer}, and how TechMedix predicts them before breakdown.`,
      url,
      siteName: "BlackCat Robotics",
      images: [{ url: "/og-techmedix.png", width: 1200, height: 630, alt: `${p.name} predictive maintenance` }],
    },
  };
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export default async function PlatformInsightPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  const p = (ALL_PLATFORMS as any[]).find((x) => x.id === platform);
  if (!p || !p.failureSignatures) notFound();

  const image = (PLATFORM_IMAGE_MAP as Record<string, string>)?.[p.id];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${p.name} failure modes & predictive maintenance`,
    description: `Documented failure signatures for the ${p.name} and how TechMedix predicts them.`,
    author: { "@type": "Organization", name: "BlackCat Robotics" },
    mainEntityOfPage: `https://blackcatrobotics.com/insights/${p.id}`,
  };

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/insights" className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 hover:text-theme-fire">
        ← All platforms
      </Link>

      <div>
        <p className="kicker">{p.manufacturer}</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          {p.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">{p.description}</p>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${p.name} by ${p.manufacturer}`}
            className="mt-6 w-full max-w-xl rounded-2xl border border-theme-12 object-cover"
          />
        )}
      </div>

      {p.specs?.length > 0 && (
        <section>
          <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">Specifications</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p.specs.map((s: any) => (
              <div key={s.label} className="rounded-xl border border-theme-12 bg-white p-4">
                <dt className="font-ui text-[0.6rem] uppercase tracking-[0.12em] text-theme-40">{s.label}</dt>
                <dd className="mt-1 font-header text-lg text-theme-primary">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section>
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          Tracked failure modes
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">
          Each signature is a telemetry condition TechMedix monitors. When it trips, an alert fires with
          lead time to schedule maintenance before breakdown.
        </p>
        <div className="mt-4 space-y-3">
          {p.failureSignatures.map((f: any) => (
            <div key={f.id} className="rounded-xl border border-theme-12 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="font-header text-lg text-theme-primary">{f.name}</div>
                <span
                  className={`rounded-full border px-3 py-1 font-ui text-[0.58rem] uppercase tracking-[0.12em] ${
                    SEVERITY_STYLE[f.severity] ?? "bg-theme-4 text-theme-60 border-theme-12"
                  }`}
                >
                  {f.severity}
                </span>
              </div>
              {f.description && (
                <p className="mt-2 text-sm leading-5 text-theme-52">{f.description}</p>
              )}
              {f.mtbfHours && (
                <p className="mt-2 font-ui text-[0.6rem] uppercase tracking-[0.1em] text-theme-40">
                  MTBF ≈ {f.mtbfHours}h
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-theme-12 bg-theme-4 p-8">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          Keep your {p.name} running
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-theme-52">
          TechMedix monitors these signatures 24/7 and predicts failures up to 48 hours in advance.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="inline-flex items-center rounded-full bg-theme-fire px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-theme-fire/90"
          >
            Book onboarding →
          </Link>
          <Link
            href="/store"
            className="inline-flex items-center rounded-full border border-theme-12 px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-theme-70 transition hover:bg-white"
          >
            Browse parts
          </Link>
        </div>
      </section>
    </div>
  );
}
