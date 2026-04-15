"use client";

import { BcrCertSection } from "../BcrCertSection";

/**
 * Certifications page — full 5-level BCR technician certification structure.
 * Level ladder, platform badges, and how-to guide are all in BcrCertSection.
 *
 * For authenticated users, the current cert level would be passed from a
 * server component via Supabase session. This client wrapper defaults to null
 * so the UI shows L1 as "In Progress" for first-time visitors.
 */
export default function CertificationsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="kicker">Field Operations</p>
        <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary lg:text-5xl">
          BCR Field Tech Certifications
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-theme-52">
          Certify your technicians to service BCR-monitored platforms. Certified techs unlock
          TechMedix dispatch eligibility, platform-specific job access, and access to the BCR marketplace.
        </p>
      </div>

      {/* Full certification module */}
      <BcrCertSection userCertLevel={null} />
    </div>
  );
}
