import Link from "next/link";
import type { Robot } from "@/lib/shared";
import { StatusPill } from "./status-pill";

function HealthBar({ value }: { value: number }) {
  const color = value > 70 ? "#1db87a" : value > 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1 w-16 rounded-full" style={{ background: "color-mix(in srgb, var(--ink) 8%, transparent)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-ui text-[0.62rem] font-semibold" style={{ color }}>{value}%</span>
    </div>
  );
}

export function RobotTable({ robots }: { robots: Robot[] }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[var(--panel-border)]">
      <table className="min-w-full divide-y divide-[var(--panel-border)] text-left text-sm">
        <thead style={{ background: "color-mix(in srgb, var(--ink) 3%, transparent)" }}>
          <tr>
            {["Robot", "Platform", "Location", "Health", "Status"].map((h) => (
              <th key={h} className="px-4 py-3 font-ui text-[0.58rem] uppercase tracking-[0.20em] text-theme-42 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--panel-border)]">
          {robots.map((robot) => (
            <tr
              key={robot.id}
              className="transition-colors duration-150"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--ink) 2.5%, transparent)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td className="px-4 py-3.5">
                <Link
                  href={`/fleet/${robot.id}`}
                  className="font-semibold text-theme-primary transition-colors hover:text-ember"
                >
                  {robot.name}
                </Link>
              </td>
              <td className="px-4 py-3.5 text-theme-55 font-ui text-[0.72rem]">{robot.platform}</td>
              <td className="px-4 py-3.5 text-theme-55 font-ui text-[0.72rem]">{robot.location}</td>
              <td className="px-4 py-3.5"><HealthBar value={robot.healthScore} /></td>
              <td className="px-4 py-3.5"><StatusPill label={robot.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
