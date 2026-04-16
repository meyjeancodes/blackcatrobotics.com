import Link from "next/link";
import { SurfaceCard } from "../../../components/surface-card";
import { formatCurrency } from "../../../lib/format";
import { getDashboardData } from "../../../lib/data";

const techmedixPlans = [
  {
    id: "operator",
    name: "Operator",
    range: "1–4 robots",
    price: "$299",
    unit: "per robot / month",
    features: ["Real-time telemetry dashboard", "48h predictive failure alerts", "Up to 2 platform integrations", "On-demand technician dispatch", "Email support — 24h response"],
  },
  {
    id: "fleet",
    name: "Fleet",
    range: "5–19 robots",
    price: "$199",
    unit: "per robot / month",
    highlight: true,
    features: ["Everything in Operator", "Unlimited platform integrations", "2 included service hours per robot/month", "Auto technician dispatch", "Priority Slack + phone — 4h response", "Monthly performance report"],
  },
  {
    id: "command",
    name: "Command",
    range: "20+ robots",
    price: "Contact",
    unit: "enterprise pricing",
    features: ["Everything in Fleet", "Dedicated AI operations manager", "Custom API + ERP integration", "SLA guarantee + legal review", "Unlimited service hours included"],
  },
];

const habitatPlans = [
  { name: "Core", price: "$49", unit: "/month", desc: "Single-unit smart home monitoring. Energy tracking, maintenance alerts, Construct.Bot status." },
  { name: "Home+", price: "$99", unit: "/month", desc: "Full HABITAT OS. AI scheduling, solar optimization, remote access, and service dispatch." },
  { name: "Portfolio", price: "$199", unit: "/month", desc: "Multi-unit management. Fleet-scale builds, developer dashboard, and API access for property portfolios." },
];

const enterpriseTiers = [
  { name: "Platform", desc: "Full TechMedix + HABITAT access under a single enterprise agreement. Custom node limits, dedicated SLA, and priority engineering." },
  { name: "Node", desc: "Node-based licensing for large-scale deployments. Price per registered node across all asset types — robots, homes, EVs, chargers." },
  { name: "Services", desc: "Managed operations, custom integrations, field technician contracts, and on-site deployment support. Contact for scope and pricing." },
];

export default async function BillingPage() {
  const { snapshot } = await getDashboardData();
  const { customer } = snapshot;

  return (
    <div className="space-y-8">
      {/* Current subscription */}
      <SurfaceCard title="Current subscription" eyebrow="Account">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="metric-value mt-1 capitalize">{customer.plan}</p>
            <div className="mt-4 space-y-2 rounded-[20px] bg-theme-3 p-4">
              <div className="flex items-center justify-between text-sm text-theme-60">
                <span>Monthly spend</span>
                <strong className="text-theme-primary">{formatCurrency(customer.monthlySpend)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-theme-60">
                <span>Fleet size</span>
                <strong className="text-theme-primary">{customer.fleetSize} robots</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-theme-60">
                <span>Status</span>
                <strong className="capitalize text-theme-primary">{customer.status}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-theme-60">
                <span>Member since</span>
                <strong className="text-theme-primary">
                  {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </strong>
              </div>
            </div>
          </div>
          <div className="rounded-[20px] border border-theme-5 bg-theme-2 p-5">
            <p className="kicker mb-3">Billing tables (future)</p>
            <div className="space-y-2 text-xs text-theme-45">
              <p className="font-medium text-theme-60">Prepared for Stripe integration:</p>
              <p>subscriptions — subscription records per product</p>
              <p>node_usage — per-node billing periods and active hours</p>
              <p>billing_events — payment events and invoice records</p>
              <p className="mt-3 text-[0.65rem] uppercase tracking-[0.14em] text-theme-30">Stripe not yet integrated</p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* TechMedix pricing */}
      <SurfaceCard title="TechMedix" eyebrow="Robot fleet maintenance">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {techmedixPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[22px] border p-5 ${
                plan.highlight
                  ? "border-ember/20 bg-ember/[0.04]"
                  : "border-theme-5 bg-theme-2"
              }`}
            >
              {plan.highlight && (
                <span className="mb-2 inline-block text-[0.6rem] uppercase tracking-[0.2em] text-ember font-semibold">
                  Most Popular
                </span>
              )}
              <p className="kicker">{plan.name}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-theme-40 mb-2">{plan.range}</p>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-theme-primary">{plan.price}</p>
              <p className="text-xs text-theme-45 mb-4">{plan.unit}</p>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-theme-55">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-25" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SurfaceCard>

      {/* HABITAT pricing */}
      <SurfaceCard title="HABITAT" eyebrow="Home as a Service">
        <div className="grid gap-4 sm:grid-cols-3">
          {habitatPlans.map((plan) => (
            <div key={plan.name} className="rounded-[22px] border border-theme-5 bg-theme-2 p-5">
              <p className="kicker">{plan.name}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-theme-primary">{plan.price}</p>
              <p className="text-xs text-theme-45 mb-3">{plan.unit}</p>
              <p className="text-xs leading-relaxed text-theme-55">{plan.desc}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>

      {/* DJI Care Refresh */}
      <SurfaceCard title="DJI Care Refresh" eyebrow="Drone protection plans">
        <div className="space-y-5">
          <p className="text-sm leading-6 text-theme-55">
            DJI Care Refresh provides replacement coverage for your drone fleet. TechMedix tracks your
            plan status, remaining replacements, and files claims — all from your drone dashboard.
          </p>

          {/* Plan comparison */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                id: "ONE_YEAR",
                name: "Care Refresh 1-Year",
                price: "From ~$79",
                unit: "per drone / year",
                replacements: "2 replacements",
                highlight: false,
                features: [
                  "Accidental damage coverage",
                  "Water damage coverage",
                  "2 replacement units per year",
                  "48-hour activation window",
                  "TechMedix claim tracking",
                ],
              },
              {
                id: "TWO_YEAR",
                name: "Care Refresh 2-Year",
                price: "From ~$119",
                unit: "per drone / 2 years",
                replacements: "3 replacements",
                highlight: true,
                features: [
                  "Everything in 1-Year",
                  "3 replacement units over 2 years",
                  "Extended coverage period",
                  "TechMedix expiry warnings",
                  "Automatic renewal reminders",
                ],
              },
              {
                id: "COMBO",
                name: "Care Refresh+ (Combo)",
                price: "From ~$139",
                unit: "per drone / year",
                replacements: "2 replacements + flyaway",
                highlight: false,
                features: [
                  "Everything in 1-Year",
                  "Flyaway / signal-loss coverage",
                  "Water damage at any depth",
                  "Priority claim processing",
                  "TechMedix Care Refresh wizard",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.id}
                className={`rounded-[22px] border p-5 ${
                  plan.highlight
                    ? "border-[#e8601e]/20 bg-[#e8601e]/[0.04]"
                    : "border-theme-5 bg-theme-2"
                }`}
              >
                {plan.highlight && (
                  <span className="mb-2 inline-block text-[0.6rem] uppercase tracking-[0.2em] text-[#e8601e] font-semibold">
                    Best Value
                  </span>
                )}
                <p className="kicker">{plan.name}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-theme-primary">{plan.price}</p>
                <p className="text-xs text-theme-45 mb-1">{plan.unit}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[#e8601e]/70 font-semibold mb-4">{plan.replacements}</p>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-theme-55">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8601e]/40" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* TechMedix vs standalone cost comparison */}
          <div className="rounded-[22px] border border-theme-5 bg-theme-18 p-5">
            <p className="kicker mb-3">TechMedix + Care Refresh vs. standalone</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-theme-60 mb-2">Without TechMedix</p>
                <ul className="space-y-1.5 text-xs text-theme-45">
                  <li>Manual claim filing through DJI portal</li>
                  <li>No expiry or replacement tracking</li>
                  <li>No diagnostic context for claims</li>
                  <li>No photo upload workflow</li>
                  <li>Manual flight log review</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#e8601e]/80 mb-2">With TechMedix</p>
                <ul className="space-y-1.5 text-xs text-theme-55">
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-[#1db87a]" />Guided 5-step claim wizard</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-[#1db87a]" />Automatic expiry + replacement alerts</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-[#1db87a]" />AI diagnostic linked to claim evidence</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-[#1db87a]" />Flight log import for flyaway claims</li>
                  <li className="flex items-start gap-1.5"><span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-[#1db87a]" />Coverage check before every dispatch</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bundle recommendation */}
          <div
            className="rounded-[22px] p-5"
            style={{ background: "linear-gradient(135deg, rgba(232,96,30,0.07) 0%, rgba(29,184,122,0.06) 100%)", border: "1px solid rgba(232,96,30,0.12)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-[#e8601e] font-semibold mb-1">Recommended Bundle</p>
                <h3 className="font-header text-xl text-theme-primary">TechMedix Fleet + DJI Care Refresh+</h3>
                <p className="mt-2 text-sm text-theme-55 max-w-md">
                  Pair your TechMedix Fleet subscription with Care Refresh+ on every drone.
                  Full diagnostic coverage, claim automation, and flyaway protection — all in one dashboard.
                </p>
              </div>
              <Link
                href="/drones"
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#e8601e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors"
              >
                Manage Drone Fleet
              </Link>
            </div>
          </div>

          <p className="text-[0.65rem] text-theme-30 leading-relaxed">
            * DJI Care Refresh pricing shown is approximate and subject to change. Verify current pricing at store.dji.com before purchase.
            TechMedix claim tracking requires an active Care Refresh plan registered to the drone serial number.
          </p>
        </div>
      </SurfaceCard>

      {/* Enterprise */}
      <SurfaceCard title="Enterprise" eyebrow="Platform + Node + Services">
        <div className="grid gap-4 sm:grid-cols-3">
          {enterpriseTiers.map((tier) => (
            <div key={tier.name} className="rounded-[22px] border border-theme-5 bg-theme-2 p-5">
              <p className="kicker mb-2">{tier.name}</p>
              <p className="text-xs leading-relaxed text-theme-55">{tier.desc}</p>
              <p className="mt-4 text-[0.6rem] uppercase tracking-[0.18em] text-theme-30">Contact for pricing</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
