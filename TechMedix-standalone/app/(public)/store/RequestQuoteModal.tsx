"use client";

import { useState } from "react";

export default function RequestQuoteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    fleetSize: "",
    partsNeeded: "",
    timeline: "",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to /api/quote-request
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({ name: "", email: "", company: "", fleetSize: "", partsNeeded: "", timeline: "", details: "" });
    }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-theme-10 px-5 py-4">
          <h3 className="font-header text-lg text-theme-primary">Request a Quote</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-theme-40 hover:bg-theme-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1db87a]/10 text-[#1db87a]">✓</div>
              <p className="mt-4 text-lg font-semibold text-theme-primary">Request Sent</p>
              <p className="mt-2 text-sm text-theme-50">We'll get back to you within 24 hours.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            <p className="text-sm text-theme-50">
              Need bulk pricing, fleet-wide parts, or something not listed? We'll source it and beat any verified price.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-theme-40">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-theme-40">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-theme-40">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-theme-40">Fleet Size</label>
                <select
                  value={formData.fleetSize}
                  onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                  className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="1-5">1-5 robots</option>
                  <option value="6-20">6-20 robots</option>
                  <option value="21-100">21-100 robots</option>
                  <option value="100+">100+ robots</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-theme-40">Parts Needed *</label>
              <input
                type="text"
                required
                placeholder="e.g., 4x H1 knee actuators, 2x Spot batteries"
                value={formData.partsNeeded}
                onChange={(e) => setFormData({ ...formData, partsNeeded: e.target.value })}
                className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary placeholder:text-theme-30 focus:border-theme-20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-theme-40">Timeline</label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary focus:border-theme-20 focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="asap">ASAP (emergency repair)</option>
                <option value="1-2weeks">1-2 weeks</option>
                <option value="1month">Within 1 month</option>
                <option value="planning">Planning / No rush</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-theme-40">Additional Details</label>
              <textarea
                rows={3}
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Any specific requirements, certifications needed, etc."
                className="w-full rounded-lg border border-theme-10 px-3 py-2 text-sm text-theme-primary placeholder:text-theme-30 focus:border-theme-20 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-ember px-4 py-3 font-ui text-sm uppercase tracking-widest text-white transition hover:bg-ember/90"
            >
              Submit Request
            </button>

            <p className="text-center text-[0.65rem] text-theme-40">
              We respond within 24 hours. All quotes include free TechMedix monitoring.
            </p>
          </form>
        )}
      </div>
    </>
  );
}
