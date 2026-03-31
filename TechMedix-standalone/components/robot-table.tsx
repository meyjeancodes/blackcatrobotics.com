import Link from "next/link";
import type { Robot } from "@/lib/shared";
import { StatusPill } from "./status-pill";

export function RobotTable({ robots }: { robots: Robot[] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-black/5">
      <table className="min-w-full divide-y divide-black/5 text-left text-sm">
        <thead className="bg-black/[0.03] text-[11px] uppercase tracking-[0.2em] text-black/45">
          <tr>
            <th className="px-4 py-3 font-medium">Robot</th>
            <th className="px-4 py-3 font-medium">Platform</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Health</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 bg-white">
          {robots.map((robot) => (
            <tr key={robot.id} className="hover:bg-black/[0.02]">
              <td className="px-4 py-4">
                <Link href={`/fleet/${robot.id}`} className="font-semibold text-black hover:text-ember">
                  {robot.name}
                </Link>
              </td>
              <td className="px-4 py-4 text-black/60">{robot.platform}</td>
              <td className="px-4 py-4 text-black/60">{robot.location}</td>
              <td className="px-4 py-4 font-semibold text-black">{robot.healthScore}%</td>
              <td className="px-4 py-4"><StatusPill label={robot.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
