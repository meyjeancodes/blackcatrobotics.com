import { EnvironmentMapView } from "@/components/environment-map-view";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Operations</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Environment Map</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          Live robot positions, zone overlays, and real-time anomaly detection.
        </p>
      </div>
      <EnvironmentMapView />
    </div>
  );
}
