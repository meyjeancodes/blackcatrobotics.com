import Link from "next/link";
import { ACQUIRE_PRODUCTS } from "@/lib/acquire/data";
import InsightCTA from "../insights/_components/InsightCTA";

export const metadata = {
  title: "Robotics Supply Markets & Bottlenecks | TechMedix by BlackCat Robotics",
  description:
    "Where the robotics supply chain concentrates — supplier market share for humanoid reducers, EV batteries, and vision sensors, and the failure modes each bottleneck drives. Sourced from public filings and industry reports.",
  alternates: { canonical: "https://blackcatrobotics.com/markets" },
  openGraph: {
    title: "Robotics Supply Markets & Bottlenecks | TechMedix",
    description:
      "Supplier concentration across humanoid reducers, EV batteries, and vision sensors — and the failure modes each bottleneck drives.",
    url: "https://blackcatrobotics.com/markets",
    type: "website",
    siteName: "BlackCat Robotics",
    images: [{ url: "/og-techmedix.png", width: 1200, height: 630 }],
  },
};

// Suppliers flagged as concentrated (single-source / dominant share). Derived
// from ACQUIRE_PRODUCTS in the "supplier" category — the source of truth for
// this data. We only render figures already present in the catalog.
const SUPPLIERS = ACQUIRE_PRODUCTS.filter((p) => p.category === "supplier");

// Map a supplier's component type to the platform insight pages that depend on it.
const SUPPLY_TO_PLATFORM: Record<string, string[]> = {
  Reducer: ["unitree-h1-2", "unitree-h1", "asimov-1", "asimov-v1"],
  Battery: ["unitree-h1-2", "unitree-go2-2", "avidbots-neo"],
  Sensor: ["unitree-h1-2", "digit-v5", "apptronik-apollo"],
};

function parseShare(specs: { label: string; value: string }[]): string | null {
  const s = specs.find((x) => x.label === "Share");
  return s ? s.value : null;
}

// Group suppliers by the component type they supply.
const BY_TYPE: Record<string, typeof SUPPLIERS> = {};
for (const s of SUPPLIERS) {
  const type = s.specs.find((x) => x.label === "Type")?.value || "Other";
  (BY_TYPE[type] ||= []).push(s);
}

export default function MarketsPage() {
  const bottleneckCount = SUPPLIERS.filter((s) => s.ribbon === "Bottleneck").length;

  return (
    <div className="space-y-10">
      <Link
        href="/"
        className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-theme-40 hover:text-theme-fire"
      >
        ← Home
      </Link>

      <div>
        <p className="kicker">TechMedix Markets</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Where the robotics supply chain concentrates
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          A robot is only as reliable as its single-source parts. These are the
          suppliers whose concentration creates real failure and sourcing risk —
          and the platforms that depend on them. Figures are estimates based on
          public filings and industry reports; verify with suppliers before
          sourcing decisions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-theme-12 bg-theme-4 p-5">
          <div className="font-header text-3xl tracking-[-0.02em] text-theme-primary">
            {SUPPLIERS.length}
          </div>
          <div className="mt-1 font-ui text-[0.6rem] uppercase tracking-[0.14em] text-theme-40">
            Suppliers tracked
          </div>
        </div>
        <div className="rounded-2xl border border-theme-12 bg-theme-4 p-5">
          <div className="font-header text-3xl tracking-[-0.02em] text-theme-primary">
            {bottleneckCount}
          </div>
          <div className="mt-1 font-ui text-[0.6rem] uppercase tracking-[0.14em] text-theme-40">
            Flagged bottlenecks
          </div>
        </div>
        <div className="rounded-2xl border border-theme-12 bg-theme-4 p-5">
          <div className="font-header text-3xl tracking-[-0.02em] text-theme-primary">
            {Object.keys(BY_TYPE).length}
          </div>
          <div className="mt-1 font-ui text-[0.6rem] uppercase tracking-[0.14em] text-theme-40">
            Component categories
          </div>
        </div>
      </div>

      {Object.entries(BY_TYPE).map(([type, suppliers]) => (
        <section key={type} className="space-y-4">
          <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
            {type} suppliers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((s) => {
              const share = parseShare(s.specs);
              const platforms = SUPPLY_TO_PLATFORM[s.specs.find((x) => x.label === "Type")?.value || ""] || [];
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-theme-12 bg-white p-5 transition hover:border-theme-fire"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-header text-lg tracking-[-0.02em] text-theme-primary">
                      {s.name}
                    </div>
                    {s.ribbon === "Bottleneck" && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 font-ui text-[0.55rem] uppercase tracking-[0.12em] text-red-700">
                        Bottleneck
                      </span>
                    )}
                  </div>
                  {s.maker && (
                    <div className="mt-0.5 font-ui text-[0.6rem] uppercase tracking-[0.12em] text-theme-40">
                      {s.maker}
                    </div>
                  )}
                  <p className="mt-2 text-sm leading-5 text-theme-52">{s.description}</p>

                  {share && (
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-header text-2xl tracking-[-0.02em] text-theme-fire">
                        {share}
                      </span>
                      <span className="font-ui text-[0.58rem] uppercase tracking-[0.12em] text-theme-40">
                        market share
                      </span>
                    </div>
                  )}

                  {platforms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {platforms.map((pid) => (
                        <Link
                          key={pid}
                          href={`/insights/${pid}`}
                          className="rounded-full border border-theme-12 px-2.5 py-1 font-ui text-[0.58rem] uppercase tracking-[0.1em] text-theme-70 transition hover:bg-theme-4"
                        >
                          {pid} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-theme-12 bg-theme-4 p-8">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          Close the loop
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">
          Single-source components are where fleets go down first. TechMedix
          watches the failure signatures those parts produce and predicts them
          before they trip.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/store"
            className="inline-flex items-center rounded-full bg-theme-fire px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-theme-fire/90"
          >
            Browse spare parts →
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center rounded-full border border-theme-12 px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-theme-70 transition hover:bg-white"
          >
            Book a diagnostic review
          </Link>
        </div>
      </section>

      <InsightCTA />
    </div>
  );
}
