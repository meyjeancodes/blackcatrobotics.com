import { BatteryForecastPanel } from "@/components/battery-forecast-panel";

export default function BatteryPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Fleet management</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">Battery & Power</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          Shift-aware charge forecasting, downtime cost estimation, and smart charge queue.
        </p>
      </div>
      <BatteryForecastPanel />
    </div>
  );
}
