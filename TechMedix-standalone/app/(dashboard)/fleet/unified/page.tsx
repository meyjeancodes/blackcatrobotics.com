import { FleetUnifiedView } from "@/components/fleet-unified-view";

export default function FleetUnifiedPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Fleet management</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Unified Fleet View</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          All robots across vendors — normalized to a single view.
        </p>
      </div>
      <FleetUnifiedView />
    </div>
  );
}
