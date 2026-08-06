import Link from "next/link";

export const metadata = {
  title: "How TechMedix Predicts Robot Failures | BlackCat Robotics",
  description:
    "The methodology behind TechMedix's 48-hour failure prediction: continuous telemetry ingestion, documented failure-mode signatures, confidence scoring, and lead-time alerts.",
};

const STEPS = [
  {
    n: "01",
    title: "Telemetry ingestion",
    body: "TechMedix ingests live robot telemetry — joint temperature, battery state, force/torque, encoder, and vision — from each platform via its native API or edge gateway. Every signal is timestamped and normalized against the platform's documented operating envelope.",
  },
  {
    n: "02",
    title: "Failure-mode signatures",
    body: "Each platform is modeled against a library of documented failure signatures (e.g. Actuator Overheat: joint temp > 75°C sustained > 30s; Joint Backlash: end-effector tracking error > 15mm). These are the same signatures rendered on every /insights platform page.",
  },
  {
    n: "03",
    title: "Confidence & drift scoring",
    body: "Signals are scored against baseline behavior. A signature that trends toward its threshold raises a confidence-weighted risk score; we surface source citations and a confidence level (high / medium / low / unverified) so operators know how much to trust each alert.",
  },
  {
    n: "04",
    title: "Lead-time alerting",
    body: "Because degradation is continuous, TechMedix projects the crossing point and fires an alert with lead time — designed for up to 48 hours before functional failure — so maintenance can be scheduled, not reacted to. Critical signatures short-circuit to immediate dispatch.",
  },
];

const FAQ = [
  {
    q: "How early can TechMedix predict a failure?",
    a: "TechMedix is designed to flag impending failures up to 48 hours in advance by modeling continuous telemetry against documented failure-mode signatures and projecting the threshold-crossing point.",
  },
  {
    q: "What telemetry does TechMedix need?",
    a: "Joint/motor temperature, battery state of charge and cell health, force/torque sensor readings, encoder state, and perception/vision feeds where available. Data is ingested via the platform's native API or an edge gateway.",
  },
  {
    q: "How are failure modes documented?",
    a: "Each platform is mapped to a library of failure signatures with severity, the exact telemetry condition that trips them, and where available a mean-time-between-failures estimate and source citations.",
  },
  {
    q: "Is TechMedix open source?",
    a: "Yes. TechMedix Core is free and open source, published by BlackCat Robotics. The source is available in the BlackCat Robotics repository.",
  },
];

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div>
        <p className="kicker">Methodology</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          How TechMedix predicts failures
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          The 48-hour prediction window is not a guess. It is the output of a four-stage pipeline that runs
          continuously across your fleet — from raw telemetry to a scheduled repair.
        </p>
      </div>

      <div className="space-y-4">
        {STEPS.map((s) => (
          <div key={s.n} className="flex gap-5 rounded-2xl border border-theme-12 bg-white p-6">
            <div className="font-header text-2xl text-theme-fire">{s.n}</div>
            <div>
              <h2 className="font-header text-xl tracking-[-0.02em] text-theme-primary">{s.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">Frequently asked</h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-theme-12 bg-white p-5">
              <div className="font-header text-lg text-theme-primary">{f.q}</div>
              <p className="mt-2 text-sm leading-6 text-theme-52">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-theme-12 bg-theme-4 p-8">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">See it on your fleet</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-theme-52">
          Browse the failure modes we track per platform, or book a fleet onboarding call.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/insights"
            className="inline-flex items-center rounded-full bg-theme-fire px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-white transition hover:bg-theme-fire/90"
          >
            Explore insights →
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center rounded-full border border-theme-12 px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-theme-70 transition hover:bg-white"
          >
            Book onboarding
          </Link>
        </div>
      </section>
    </div>
  );
}
