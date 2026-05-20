"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Activity } from "lucide-react";
import { getLoopComplianceEntries, type LoopComplianceEntry } from "../lib/shared/operational-loop";

export function ComplianceActivity() {
  const [entries, setEntries] = useState<LoopComplianceEntry[]>([]);

  useEffect(() => {
    setEntries(getLoopComplianceEntries());
  }, []);

  if (entries.length === 0) return null;

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-emerald-600" />
        <h3 className="font-header text-lg text-[var(--ink)]">Live Activity</h3>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 font-ui text-[0.48rem] uppercase tracking-[0.12em] font-semibold text-emerald-700">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          {entries.length} job{entries.length !== 1 ? "s" : ""} closed this session
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--ink)]/[0.06]">
              {["Closed", "Technician", "Robot", "Action", "Standard", "Result"].map((h) => (
                <th key={h} className="pb-3 text-left font-ui text-[0.46rem] uppercase tracking-[0.12em] text-[var(--ink)]/30 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-[var(--ink)]/[0.04] last:border-0">
                <td className="py-3 pr-4 font-mono text-[0.56rem] text-[var(--ink)]/40">
                  {new Date(entry.closedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-3 pr-4 text-[var(--ink)]/70">{entry.techName}</td>
                <td className="py-3 pr-4 text-[var(--ink)]/55">{entry.robotName}</td>
                <td className="py-3 pr-4 text-[var(--ink)]/60 max-w-[220px]">{entry.action}</td>
                <td className="py-3 pr-4 font-mono text-[0.54rem] text-[var(--ink)]/38">{entry.standard}</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-ui text-[0.44rem] uppercase tracking-[0.10em] font-semibold text-emerald-700">
                    <CheckCircle2 size={9} />
                    pass
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
