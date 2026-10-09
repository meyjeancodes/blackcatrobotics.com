import Link from "next/link";

export const metadata = {
  title: "Integrations — Connect TechMedix to Your Assistant | BlackCat Robotics",
  description:
    "Connect TechMedix to Muse and other AI assistants as a custom connector. Query fleet health, alerts, failure modes, repair protocols, AR guidance, and parts in natural language over an authenticated OpenAPI endpoint.",
  alternates: { canonical: "https://blackcatrobotics.com/integrations" },
  openGraph: {
    title: "Integrations — Connect TechMedix to Your Assistant",
    description:
      "Connect TechMedix to Muse as a custom connector. Fleet health, alerts, failure modes, repair protocols, AR guidance, and parts — in natural language.",
    url: "https://blackcatrobotics.com/integrations",
    siteName: "BlackCat Robotics",
    images: [{ url: "/og-techmedix.png", width: 1200, height: 630, alt: "TechMedix integrations" }],
  },
};

const SPEC_URL = "https://blackcatrobotics.com/.well-known/techmedix-openapi.yaml";

const SETUP_PROMPT = `I want to connect TechMedix (AI maintenance intelligence for my robot fleet) as a custom connector. The OpenAPI spec is at ${SPEC_URL}

Build the connector from that spec. Then ask me for my TechMedix API key (it starts with tmdx_live_) and store it securely — send it as Authorization: Bearer <key> on every call.

My customer ID is: _____

Rules:
- Read tools (fleet_status, alerts_list, platform_catalog, diagnose, ar_guidance, parts_advisor, tasks_list) need no confirmation.
- Write tools (dispatch_create, alert_resolve, task_create) ALWAYS need my explicit confirmation first.
- When creating a dispatch or task, generate a UUID and send it as the Idempotency-Key header so retries never duplicate work.
- Never claim a payment, telemetry ingestion, or robot-control capability — the connector can't do those.`;

const CAPABILITIES = [
  {
    label: "Fleet health",
    body: "\u201cHow's my fleet doing right now?\u201d — every robot with its latest alert and open work order.",
  },
  {
    label: "Alerts",
    body: "\u201cShow me active alerts across the fleet.\u201d — filter by status and robot, newest first.",
  },
  {
    label: "Failure modes",
    body: "\u201cWhat are the known failure modes for the Unitree H1?\u201d — documented signatures per platform.",
  },
  {
    label: "Repair protocols",
    body: "\u201cGive me the repair protocol for knee actuator drift on the H1.\u201d — step-by-step.",
  },
  {
    label: "AR guidance",
    body: "\u201cI need AR repair guidance for H1-07's left knee actuator.\u201d — overlay instructions + confidence.",
  },
  {
    label: "Parts advisor",
    body: "\u201cFind me a replacement knee actuator for the H1, in stock in the US.\u201d — matching parts + suppliers.",
  },
  {
    label: "Diagnostics",
    body: "\u201cRun a diagnostic analysis on platform unitree-h1 with this telemetry.\u201d — a scored report.",
  },
  {
    label: "Dispatch",
    body: "\u201cCreate a work order for H1-07's actuator fault, high priority.\u201d — confirms first, idempotent.",
  },
];

const FAQ = [
  {
    q: "Do I need a directory listing to connect TechMedix?",
    a: "No. Any Muse user can connect TechMedix today as a Custom Connector — point Muse at the OpenAPI spec at blackcatrobotics.com/.well-known/techmedix-openapi.yaml and paste the setup prompt. A reviewed directory listing is in progress.",
  },
  {
    q: "How is the connection authenticated?",
    a: "With a per-customer Bearer API key issued in the TechMedix dashboard. The key is bound to your customer ID server-side, so it can never read another customer's fleet. Only a SHA-256 hash of the key is stored; the full key is shown once at mint time.",
  },
  {
    q: "Can the connector place orders or control my robots?",
    a: "No. The connector cannot process payments, ingest raw device telemetry, or modify robot firmware. Payment checkout stays on the website and telemetry uses a separate ingestion firehose. Write actions (creating a work order, resolving an alert, adding a task) always require your explicit confirmation.",
  },
  {
    q: "Are retries safe?",
    a: "Yes. Work-order and task creation honor an Idempotency-Key header, so a retried request never creates duplicate work.",
  },
];

export default function IntegrationsPage() {
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
        <p className="kicker">Integrations</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          Talk to your fleet
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          TechMedix is an authenticated OpenAPI connector. Point Muse — or any assistant that speaks
          OpenAPI — at the spec below and query fleet health, alerts, failure modes, repair protocols,
          AR guidance, and parts in natural language. No SDK, no directory review.
        </p>
      </div>

      <section className="rounded-2xl border border-theme-12 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-ui text-[0.6rem] uppercase tracking-[0.16em] text-theme-40">
              Published spec
            </div>
            <div className="mt-1 font-ui text-sm text-theme-primary">
              blackcatrobotics.com/.well-known/techmedix-openapi.yaml
            </div>
          </div>
          <a
            href={SPEC_URL}
            className="inline-flex items-center rounded-full bg-ember px-5 py-2 font-ui text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ember/90"
          >
            Open the spec →
          </a>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          OpenAPI 3.1 · Bearer auth · per-customer keys. The same spec powers the reviewed Muse
          connector submission.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          What you can ask
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div key={c.label} className="rounded-2xl border border-theme-12 bg-white p-5">
              <div className="font-ui text-[0.6rem] uppercase tracking-[0.16em] text-ember">
                {c.label}
              </div>
              <p className="mt-2 text-sm leading-6 text-theme-52">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          Connect in three steps
        </h2>
        <div className="space-y-4">
          <div className="flex gap-5 rounded-2xl border border-theme-12 bg-white p-6">
            <div className="font-header text-2xl text-ember">01</div>
            <div>
              <h3 className="font-header text-xl tracking-[-0.02em] text-theme-primary">
                Get an API key
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">
                Sign in to the TechMedix dashboard → Settings → API keys → Mint key. The key is shown
                once — save it immediately. It starts with <code>tmdx_live_</code>.
              </p>
              <Link
                href="https://dashboard.blackcatrobotics.com/signup"
                className="mt-3 inline-block font-ui text-[0.62rem] uppercase tracking-[0.14em] text-ember"
              >
                Open the dashboard →
              </Link>
            </div>
          </div>

          <div className="flex gap-5 rounded-2xl border border-theme-12 bg-white p-6">
            <div className="font-header text-2xl text-ember">02</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-header text-xl tracking-[-0.02em] text-theme-primary">
                Paste the setup prompt into Muse
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">
                Muse builds the connector from the published spec and asks for your key. Copy the
                prompt, fill in your customer ID, and paste it in.
              </p>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-theme-12 bg-theme-4 p-4 font-ui text-[0.72rem] leading-5 text-theme-70">
{SETUP_PROMPT}
              </pre>
            </div>
          </div>

          <div className="flex gap-5 rounded-2xl border border-theme-12 bg-white p-6">
            <div className="font-header text-2xl text-ember">03</div>
            <div>
              <h3 className="font-header text-xl tracking-[-0.02em] text-theme-primary">
                Ask
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">
                &ldquo;How&apos;s my fleet doing right now?&rdquo; Read tools run immediately; write
                tools (create work order, resolve alert, add task) always ask for your confirmation
                first.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          Frequently asked
        </h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl border border-theme-12 bg-white p-5">
              <h3 className="font-header text-lg tracking-[-0.01em] text-theme-primary">{f.q}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-theme-52">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-theme-12 bg-theme-4 p-8">
        <h2 className="font-header text-2xl tracking-[-0.02em] text-theme-primary">
          Muse directory listing — in review
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-52">
          The reviewed Muse connector submission (functional, security, and legal review by Meta) is
          prepared and queued. Until it lists, the Custom Connector path above gets you connected today.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={SPEC_URL}
            className="inline-flex items-center rounded-full bg-ember px-5 py-2 font-ui text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ember/90"
          >
            View the OpenAPI spec
          </a>
          <Link
            href="/how-it-works"
            className="inline-flex items-center rounded-full border border-theme-12 px-5 py-2 font-ui text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-theme-70 transition hover:bg-theme-4"
          >
            How TechMedix works
          </Link>
        </div>
      </section>
    </div>
  );
}
