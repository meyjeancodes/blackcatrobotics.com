"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, ShieldCheck } from "lucide-react";

type KpiState = {
  downtimePrevented: number;
  systemEfficiency: number;
  risksMitigated: number;
};

function jitter(base: number, range: number): number {
  return +(base + (Math.random() * range * 2 - range)).toFixed(1);
}

export function PerformanceKpis() {
  const [kpis, setKpis] = useState<KpiState>({
    downtimePrevented: 847,
    systemEfficiency: 94.2,
    risksMitigated: 3,
  });

  useEffect(() => {
    const id = setInterval(() => { // Fix 4
      setKpis((prev) => ({
        downtimePrevented: Math.max(800, Math.round(jitter(prev.downtimePrevented, 2))),
        systemEfficiency: Math.min(99.9, Math.max(86, +jitter(prev.systemEfficiency, 0.3).toFixed(1))),
        risksMitigated: Math.max(1, Math.round(jitter(prev.risksMitigated, 0.4))),
      }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <div className="panel-elevated p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="kicker">Downtime Prevented</p>
            <p className="metric-value mt-3 transition-all duration-500">
              {kpis.downtimePrevented}
              <span className="font-body text-xl font-normal text-theme-38 ml-1.5">hrs</span>
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-moss/[0.10] p-3 text-moss ring-1 ring-moss/[0.12]">
            <Clock size={18} />
          </div>
        </div>
        <p className="text-sm leading-6 text-theme-55">
          Estimated operational hours preserved through predictive intervention this quarter.
        </p>
      </div>

      <div className="panel-elevated p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="kicker">System Efficiency</p>
            <p className="metric-value mt-3 transition-all duration-500">
              {kpis.systemEfficiency.toFixed(1)}
              <span className="font-body text-xl font-normal text-theme-38 ml-0.5">%</span>
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-ember/[0.08] p-3 text-ember ring-1 ring-ember/[0.12]">
            <TrendingUp size={18} />
          </div>
        </div>
        <p className="text-sm leading-6 text-theme-55">
          Cross-fleet operational efficiency index based on uptime, response latency, and task completion.
        </p>
      </div>

      <div className="panel-elevated p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="kicker">Active Risk Mitigation</p>
            <p className="metric-value mt-3 transition-all duration-500">
              {kpis.risksMitigated}
              <span className="font-body text-xl font-normal text-theme-38 ml-1.5">events</span>
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-gold/[0.14] p-3 text-gold ring-1 ring-gold/[0.16]">
            <ShieldCheck size={18} />
          </div>
        </div>
        <p className="text-sm leading-6 text-theme-55">
          Active risk flags tracked and routed through the dispatch and maintenance pipeline.
        </p>
      </div>
    </section>
  );
}
