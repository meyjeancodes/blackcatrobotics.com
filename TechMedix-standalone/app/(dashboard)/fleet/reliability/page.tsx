import { ReliabilityDashboard } from "@/components/reliability-dashboard";

export default function ReliabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Fleet analytics</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Reliability Dashboard</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          MTBF, MTTR, uptime trends, and manufacturer accountability reports.
        </p>
      </div>
      <ReliabilityDashboard />
    </div>
  );
}
