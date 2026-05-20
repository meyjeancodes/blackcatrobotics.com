import { IncidentDashboard } from "@/components/incident-logger";

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Operations</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Incident Log</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          Edge-case capture with telemetry snapshots — feeds directly into retraining pipelines.
        </p>
      </div>
      <IncidentDashboard />
    </div>
  );
}
