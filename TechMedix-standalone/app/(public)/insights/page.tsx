import Link from "next/link";
import ALL_PLATFORMS from "@/lib/platforms";
import InsightCTA from "./_components/InsightCTA";

export const metadata = {
  title: "Robotics Maintenance Insights & Failure Modes | TechMedix",
  description:
    "TechMedix research on predictive maintenance for autonomous robots — failure modes, telemetry signatures, and MTBF data across humanoids, drones, AMRs, and EV fleets.",
  alternates: { canonical: "https://blackcatrobotics.com/insights" },
  openGraph: {
    title: "Robotics Maintenance Insights & Failure Modes | TechMedix",
    description:
      "Failure modes and predictive maintenance across autonomous fleets — humanoids, drones, AMRs, and EV fleets.",
    url: "https://blackcatrobotics.com/insights",
    siteName: "BlackCat Robotics",
    images: [{ url: "/og-techmedix.png", width: 1200, height: 630, alt: "TechMedix predictive maintenance" }],
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  humanoid: "Humanoids",
  drone: "Drones & UAVs",
  industrial: "Industrial & AMR",
  delivery: "Delivery Robots",
  micromobility: "Micromobility",
  medical: "Medical",
  datacenter: "Data Center",
};

export default function InsightsIndexPage() {
  const platforms = ALL_PLATFORMS.filter(
    (p: any) => p.category && p.description && !p.id.includes("-wear") && !p.id.includes("drift") && p.failureSignatures
  );
  const categories = Array.from(new Set(platforms.map((p: any) => p.category)));

  return (
    <div className="space-y-12">
      <div>
        <p className="kicker">TechMedix Insights</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Failure modes & predictive maintenance
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          Real failure signatures we track across autonomous fleets — what breaks, the telemetry that
          flags it, and how early TechMedix predicts it. Every entry is derived from the same
          platform models that power the live console.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat} className="space-y-4">
          <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
            {CATEGORY_LABEL[cat as string] ?? cat}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platforms
              .filter((p: any) => p.category === cat)
              .map((p: any) => (
                <Link
                  key={p.id}
                  href={`/insights/${p.id}`}
                  className="group rounded-2xl border border-theme-12 bg-white p-5 transition hover:border-theme-fire"
                >
                  <div className="font-ui text-[0.6rem] uppercase tracking-[0.16em] text-theme-40">
                    {p.manufacturer}
                  </div>
                  <div className="mt-1 font-header text-xl tracking-[-0.02em] text-theme-primary">
                    {p.name}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-theme-52">{p.description}</p>
                  <div className="mt-3 font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-fire">
                    {p.failureSignatures.length} tracked failure modes →
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-theme-12 bg-theme-4 p-8">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          How TechMedix predicts failures
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">
          The methodology behind the 48-hour prediction window — telemetry ingestion, failure-mode
          modeling, and confidence scoring.
        </p>
        <Link
          href="/how-it-works"
          className="mt-4 inline-flex items-center rounded-full bg-theme-fire px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-theme-fire/90"
        >
          Read the methodology →
        </Link>
      </section>

      <InsightCTA />

      <section className="rounded-2xl border border-theme-12 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-header text-lg tracking-[-0.02em] text-theme-primary">Field guides &amp; deep dives</h3>
            <p className="mt-1 text-sm text-theme-52">Practical writing on predictive maintenance and failure modes.</p>
          </div>
          <Link
            href="/insights/blog"
            className="inline-flex items-center rounded-full bg-theme-fire px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-theme-fire/90"
          >
            Read the blog →
          </Link>
        </div>
      </section>
    </div>
  );
}
