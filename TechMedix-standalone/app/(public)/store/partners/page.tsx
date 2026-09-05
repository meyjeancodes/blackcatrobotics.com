"use client";

import { useState } from "react";

const PARTNERS = [
  {
    name: "Unitree Robotics",
    type: "OEM Partner",
    status: "In Discussion",
    description: "Official distributor for H1, G1, H2 parts. Direct factory pricing on actuators, batteries, compute modules, and dexterous hands.",
    parts: ["H1 Actuators", "G1 Dex1 Hands", "Batteries", "Compute Modules", "Chargers"],
    contact: "sales_global@unitree.com",
    website: "https://unitree.com",
  },
  {
    name: "Boston Dynamics",
    type: "Parts Partner",
    status: "Planned",
    description: "Authorized Spot parts reseller. Leg actuators, arms, batteries, chargers, and payload mounting systems.",
    parts: ["Spot Leg Actuators", "Spot Arm", "Batteries", "Chargers", "Payload Mounts"],
    contact: "partners@bostondynamics.com",
    website: "https://bostondynamics.com",
  },
  {
    name: "DJI Agriculture",
    type: "Reseller",
    status: "Planned",
    description: "DJI Agras T50/T60 parts. Propellers, motors, spray pumps, batteries, and radar modules.",
    parts: ["Propellers", "Brushless Motors", "Spray Pumps", "Batteries", "Radar"],
    contact: "enterprise@dji.com",
    website: "https://dji.com/agriculture",
  },
  {
    name: "Inspire Robots",
    type: "OEM Partner",
    status: "In Discussion",
    description: "RH56DFQ dexterous hands. 5-finger, 3kg payload, integrated force sensor. Compatible with Unitree H1/G1.",
    parts: ["RH56DFQ Hand", "RH56H1 Hand"],
    contact: "info@inspire-robots.com",
    website: "https://en.inspire-robots.com",
  },
  {
    name: "CubeMars",
    type: "Component Supplier",
    status: "Planned",
    description: "Direct BLDC actuators and motors. The same drive units used in Unitree robots. Source for Direct tier parts.",
    parts: ["Actuators", "Motors", "Drive Units"],
    contact: "sales@cubemars.com",
    website: "https://cubemars.com",
  },
];

const SUPPLY_CHAIN = [
  { region: "US Warehouse", location: "Austin, TX", leadTime: "24-48h", coverage: "North America" },
  { region: "EU Warehouse", location: "Rotterdam, NL", leadTime: "2-3 days", coverage: "European Union" },
  { region: "Asia Direct", location: "Shenzhen, CN", leadTime: "5-7 days", coverage: "Asia Pacific" },
];

export default function PartnersPage() {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <a href="/store" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80 transition">
          ← Back to Store
        </a>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          Supply Chain & Partners
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-50">
          We partner with the world's leading robotics manufacturers to bring you genuine parts at the best prices. Every part is sourced, tested, and backed by TechMedix monitoring.
        </p>
      </header>

      {/* Partner Status Legend */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs text-theme-50">
          <div className="h-2 w-2 rounded-full bg-[#1db87a]" /> Active
        </div>
        <div className="flex items-center gap-1.5 text-xs text-theme-50">
          <div className="h-2 w-2 rounded-full bg-amber-500" /> In Discussion
        </div>
        <div className="flex items-center gap-1.5 text-xs text-theme-50">
          <div className="h-2 w-2 rounded-full bg-theme-20" /> Planned
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PARTNERS.map((partner) => {
          const statusColor = partner.status === "Active" ? "#1db87a" : partner.status === "In Discussion" ? "#f59e0b" : "#d1d5db";
          const isSelected = selectedPartner === partner.name;

          return (
            <div
              key={partner.name}
              onClick={() => setSelectedPartner(isSelected ? null : partner.name)}
              className={`cursor-pointer rounded-2xl border bg-white p-5 transition hover:shadow-md ${
                isSelected ? "border-ember ring-1 ring-ember/20" : "border-theme-10 hover:border-theme-20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-theme-primary">{partner.name}</h3>
                  <p className="text-xs text-theme-400">{partner.type}</p>
                </div>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                >
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                  {partner.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-theme-50">{partner.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {partner.parts.map((part) => (
                  <span key={part} className="rounded-full bg-theme-5 px-2 py-0.5 text-[0.6rem] text-theme-50">
                    {part}
                  </span>
                ))}
              </div>

              {isSelected && (
                <div className="mt-4 border-t border-theme-10 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-40">Contact</span>
                    <a href={`mailto:${partner.contact}`} className="text-[#cc3d17] hover:underline">
                      {partner.contact}
                    </a>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-theme-40">Website</span>
                    <a href={partner.website} target="_blank" rel="noopener" className="text-[#cc3d17] hover:underline">
                      {partner.website.replace("https://", "")}
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Supply Chain */}
      <div className="mt-12">
        <h2 className="font-header text-2xl tracking-[-0.04em] text-theme-primary">Fulfillment Network</h2>
        <p className="mt-2 text-sm text-theme-50">Parts ship from verified warehouses. Hazmat-certified battery shipping available.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {SUPPLY_CHAIN.map((hub) => (
            <div key={hub.region} className="rounded-xl border border-theme-10 bg-white p-5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#1db87a]" />
                <span className="font-ui text-xs uppercase tracking-wider text-theme-40">{hub.region}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-theme-primary">{hub.location}</p>
              <div className="mt-3 space-y-1 text-xs text-theme-50">
                <div className="flex justify-between">
                  <span>Lead time</span>
                  <span className="font-medium text-theme-primary">{hub.leadTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage</span>
                  <span className="font-medium text-theme-primary">{hub.coverage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-ember/5 p-8 text-center">
        <h3 className="font-header text-xl text-theme-primary">Become a Partner</h3>
        <p className="mt-2 text-sm text-theme-50">
          Are you a robotics manufacturer or distributor? Let's talk about how BlackCat can move your parts.
        </p>
        <a
          href="mailto:parts@blackcatrobotics.com"
          className="mt-4 inline-flex rounded-xl bg-ember px-6 py-2.5 font-ui text-xs uppercase tracking-widest text-white transition hover:bg-ember/90"
        >
          Contact Partnerships
        </a>
      </div>
    </main>
  );
}
