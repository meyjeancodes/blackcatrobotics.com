"use client";

import { useState } from "react";
import { X, Star, MapPin, Clock, Wrench, Plus } from "lucide-react";
import { StatusPill } from "../../../../components/status-pill";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TECHS = [
  {
    id: "t1",
    name: "Darius Wells",
    certification: "Micromobility · Level 2",
    location: "Dallas, TX",
    rating: 4.9,
    reviews: 47,
    responseTime: "~25 min",
    rate: "$65/hr",
    available: true,
    platforms: ["lime-gen4", "bird-three", "radcommercial"],
  },
  {
    id: "t2",
    name: "Priya Nair",
    certification: "Micromobility · Level 1",
    location: "Austin, TX",
    rating: 4.7,
    reviews: 22,
    responseTime: "~40 min",
    rate: "$55/hr",
    available: true,
    platforms: ["lime-gen4", "bird-three"],
  },
  {
    id: "t3",
    name: "Marcus Osei",
    certification: "Micromobility · Level 2",
    location: "Houston, TX",
    rating: 4.8,
    reviews: 31,
    responseTime: "~1 hr",
    rate: "$60/hr",
    available: false,
    platforms: ["lime-gen4", "radcommercial"],
  },
];

const ACTIVE_JOBS = [
  {
    id: "j1",
    platform: "Lime Gen 4 eBike",
    platformId: "lime-gen4",
    techName: "Darius Wells",
    service: "Hub Motor Diagnostic",
    status: "in-progress",
    eta: "~45 min remaining",
    cost: "$75",
  },
  {
    id: "j2",
    platform: "Bird Three E-Scooter",
    platformId: "bird-three",
    techName: "Priya Nair",
    service: "Brake Adjustment + Tire Swap",
    status: "dispatched",
    eta: "~1h 20min",
    cost: "$90",
  },
];

const PLATFORMS = ["lime-gen4", "bird-three", "radcommercial", "knightscope-k5", "avidbots-neo"];
const SERVICE_TYPES = [
  "Battery Swap / Replace",
  "Brake Adjustment",
  "Tire Swap / Repair",
  "Hub Motor Diagnostic",
  "Full Bench Service",
  "Emergency Roadside",
  "Firmware Update",
];
const PRIORITIES = ["Standard (24hr)", "Expedited (4hr)", "Emergency (1hr)"];

// ─── Modal ────────────────────────────────────────────────────────────────────

function JobModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    platform: "",
    location: "",
    serviceType: "",
    priority: "Standard (24hr)",
    notes: "",
  });

  function set(key: keyof typeof form, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="panel-elevated w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-black/35 transition hover:bg-black/[0.06] hover:text-black"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <p className="kicker">New Job Posting</p>
          <h2 className="mt-2 font-header text-xl leading-tight text-black">Post a Service Request</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/45 mb-1.5">Platform</label>
            <select
              value={form.platform}
              onChange={(e) => set("platform", e.target.value)}
              className="w-full rounded-[14px] border border-black/[0.10] bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-ember/40 focus:ring-1 focus:ring-ember/20"
            >
              <option value="">Select platform…</option>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/45 mb-1.5">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="City, State or address"
              className="w-full rounded-[14px] border border-black/[0.10] bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-ember/40 focus:ring-1 focus:ring-ember/20"
            />
          </div>
          <div>
            <label className="block font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/45 mb-1.5">Service Type</label>
            <select
              value={form.serviceType}
              onChange={(e) => set("serviceType", e.target.value)}
              className="w-full rounded-[14px] border border-black/[0.10] bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-ember/40 focus:ring-1 focus:ring-ember/20"
            >
              <option value="">Select service…</option>
              {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/45 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className="w-full rounded-[14px] border border-black/[0.10] bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-ember/40 focus:ring-1 focus:ring-ember/20"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-ui text-[0.60rem] uppercase tracking-[0.18em] text-black/45 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Describe the issue or any access requirements…"
              className="w-full rounded-[14px] border border-black/[0.10] bg-white px-3 py-2.5 text-sm text-black outline-none resize-none focus:border-ember/40 focus:ring-1 focus:ring-ember/20"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-black/[0.12] px-4 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-black/55 transition hover:bg-black/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-ember px-4 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-white transition hover:bg-ember/90"
          >
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8">
      {showModal && <JobModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Field Operations</p>
          <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-black lg:text-5xl">
            BCR Technician Marketplace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/52">
            Connect with BCR-certified field technicians for on-demand service and maintenance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-ember/[0.09] px-3 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.18em] font-semibold text-ember">
            15% Platform Fee
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-white transition hover:bg-ember/90"
          >
            <Plus size={13} />
            Post a Job
          </button>
        </div>
      </div>

      {/* Available techs */}
      <section>
        <div className="mb-5">
          <p className="kicker">Available Now</p>
          <h2 className="mt-2 font-header text-2xl leading-tight text-black">Available Technicians</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {MOCK_TECHS.map((tech) => (
            <div key={tech.id} className="panel-elevated p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember/[0.10] text-sm font-semibold text-ember">
                    {tech.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black text-sm">{tech.name}</h3>
                    <p className="font-ui text-[0.55rem] uppercase tracking-[0.12em] text-black/40">{tech.certification}</p>
                  </div>
                </div>
                <StatusPill label={tech.available ? "available" : "busy"} />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5 text-xs text-black/50">
                  <MapPin size={11} className="text-black/30 shrink-0" />
                  {tech.location}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-black/50">
                  <Clock size={11} className="text-black/30 shrink-0" />
                  {tech.responseTime}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-black/50">
                  <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                  {tech.rating} ({tech.reviews} reviews)
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-black">
                  <Wrench size={11} className="text-black/30 shrink-0" />
                  {tech.rate}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {tech.platforms.map((p) => (
                  <span key={p} className="rounded-full bg-black/[0.04] px-2 py-0.5 font-ui text-[0.52rem] uppercase tracking-[0.10em] text-black/38">
                    {p}
                  </span>
                ))}
              </div>

              <button
                disabled={!tech.available}
                className={[
                  "mt-auto rounded-full px-4 py-2.5 font-ui text-[0.62rem] uppercase tracking-[0.18em] font-semibold transition",
                  tech.available
                    ? "bg-ember text-white hover:bg-ember/90"
                    : "bg-black/[0.05] text-black/30 cursor-not-allowed",
                ].join(" ")}
              >
                {tech.available ? "Request Dispatch" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Active jobs */}
      <section>
        <div className="mb-5">
          <p className="kicker">In Progress</p>
          <h2 className="mt-2 font-header text-2xl leading-tight text-black">Active Jobs</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {ACTIVE_JOBS.map((job) => (
            <div key={job.id} className="panel-elevated p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-black">{job.platform}</h3>
                  <p className="mt-0.5 text-xs text-black/45">{job.service}</p>
                </div>
                <StatusPill label={job.status} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="font-ui text-[0.56rem] uppercase tracking-[0.16em] text-black/35">Technician</p>
                  <p className="mt-0.5 text-sm font-medium text-black">{job.techName}</p>
                </div>
                <div>
                  <p className="font-ui text-[0.56rem] uppercase tracking-[0.16em] text-black/35">ETA</p>
                  <p className="mt-0.5 text-sm text-black/60">{job.eta}</p>
                </div>
                <div>
                  <p className="font-ui text-[0.56rem] uppercase tracking-[0.16em] text-black/35">Est. Cost</p>
                  <p className="mt-0.5 text-sm font-semibold text-black">{job.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
