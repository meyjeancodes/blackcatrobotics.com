import type { PlatformProfile } from "../lib/platforms";

// ─── Deterministic mock "last service" date ───────────────────────────────────

function mockLastServiceDays(platformId: string, key: string): number {
  let h = 0;
  const s = platformId + key;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 181; // 0–180 days ago
}

// ─── Status logic ─────────────────────────────────────────────────────────────

function parseIntervalDays(interval: string): number | null {
  const dayMatch = interval.match(/(\d+)\s*day/i);
  if (dayMatch) return parseInt(dayMatch[1]);
  const monthMatch = interval.match(/(\d+)\s*month/i);
  if (monthMatch) return parseInt(monthMatch[1]) * 30;
  if (/monthly/i.test(interval)) return 30;
  if (/weekly/i.test(interval)) return 7;
  if (/annual/i.test(interval)) return 365;
  return null;
}

type ServiceStatus = "CURRENT" | "DUE SOON" | "OVERDUE";

function getStatus(daysSince: number, interval: string): ServiceStatus {
  const periodDays = parseIntervalDays(interval);
  if (periodDays === null) return "CURRENT";
  const remaining = periodDays - daysSince;
  if (remaining < 0) return "OVERDUE";
  if (remaining <= 14) return "DUE SOON";
  return "CURRENT";
}

const STATUS_STYLES: Record<ServiceStatus, string> = {
  CURRENT:   "bg-moss/[0.10] text-moss",
  "DUE SOON":"bg-amber-50 text-amber-600",
  OVERDUE:   "bg-ember/[0.10] text-ember",
};

// ─── Label map ────────────────────────────────────────────────────────────────

const KEY_LABELS: Record<string, string> = {
  batterySwap:        "Battery Swap / Replace",
  batteryCheck:       "Battery Check",
  batteryInspect:     "Battery Inspection",
  batteryBalance:     "Battery Balancing",
  brakeInspect:       "Brake Inspection",
  tirePressure:       "Tire Pressure Check",
  stemTorque:         "Stem Torque Check",
  motorCurrentBase:   "Motor Current Baseline",
  bearingVibration:   "Bearing Vibration Test",
  frameCrack:         "Frame Crack Inspection",
  firmwareAudit:      "Firmware Audit",
  fullBenchTest:      "Full Bench Test",
  wheelTruing:        "Wheel Truing",
  rackInspect:        "Rack Mount Inspection",
  rangeCalibration:   "Range Calibration",
  alarmSystemCheck:   "Alarm System Check",
  brakeCorrosion:     "Brake Lever Corrosion Check",
  sensorCalibration:  "Sensor Calibration",
  wheelInspect:       "Wheel Inspection",
  lidarCleaning:      "LiDAR Cleaning",
  connectivityAudit:  "Connectivity Audit",
  lidarCalibration:   "LiDAR Calibration",
  brushReplacement:   "Brush Pad Replacement",
  filterClean:        "Filter Cleaning",
  tankSealInspect:    "Tank Seal Inspection",
  scannerClean:       "Barcode Scanner Cleaning",
  estopTest:          "E-Stop Response Test",
  bearingInspect:     "Bearing Inspection",
  fullServiceVisit:   "Full Service Visit",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MaintenanceSchedule({ platform }: { platform: PlatformProfile }) {
  const intervals = platform.maintenanceIntervals;
  if (!intervals || Object.keys(intervals).length === 0) return null;

  const rows = Object.entries(intervals).map(([key, cfg]) => {
    const daysSince = mockLastServiceDays(platform.id, key);
    const lastDate = new Date(Date.now() - daysSince * 86400000);
    const status = getStatus(daysSince, cfg.interval);
    return { key, cfg, daysSince, lastDate, status };
  });

  const overdueCount = rows.filter((r) => r.status === "OVERDUE").length;
  const dueSoonCount = rows.filter((r) => r.status === "DUE SOON").length;

  return (
    <section className="panel-elevated p-6">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-4 pb-5 border-b border-theme-5">
        <div>
          <p className="kicker">Preventive Maintenance</p>
          <h2 className="mt-2 font-header text-xl leading-tight text-theme-primary">
            Maintenance Schedule
          </h2>
        </div>
        <div className="flex gap-2 shrink-0">
          {overdueCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-ember/[0.10] px-3 py-1 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-ember">
              {overdueCount} overdue
            </span>
          )}
          {dueSoonCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-amber-600">
              {dueSoonCount} due soon
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-theme-5">
              {["Service Item", "Interval", "Last Service", "Status", "Signal"].map((h) => (
                <th
                  key={h}
                  className="pb-3 text-left font-ui text-[0.57rem] uppercase tracking-[0.18em] text-theme-35 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {rows.map(({ key, cfg, daysSince, lastDate, status }) => (
              <tr key={key} className="transition-colors hover:bg-theme-15">
                <td className="py-3 pr-4 font-medium text-theme-primary text-sm">
                  {KEY_LABELS[key] ?? key}
                </td>
                <td className="py-3 pr-4 text-xs text-theme-55 whitespace-nowrap">
                  {cfg.interval}
                </td>
                <td className="py-3 pr-4 text-xs text-theme-45 whitespace-nowrap">
                  {daysSince === 0
                    ? "Today"
                    : `${lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (${daysSince}d ago)`}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-ui text-[0.55rem] uppercase tracking-[0.14em] font-semibold ${STATUS_STYLES[status]}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="py-3 text-xs text-theme-35 font-mono">
                  {cfg.signal ?? (
                    <span className="text-theme-20">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
