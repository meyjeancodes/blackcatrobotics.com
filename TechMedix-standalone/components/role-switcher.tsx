"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRole, ROLE_LABELS, type DashboardRole } from "@/lib/hooks/use-role";

const ROLE_COLORS: Record<DashboardRole, string> = {
  OPERATOR: "bg-sky-500/[0.14] text-sky-400 ring-sky-500/[0.22]",
  FLEET_MANAGER: "bg-emerald-500/[0.14] text-emerald-400 ring-emerald-500/[0.22]",
  MAINTENANCE_TECH: "bg-amber-500/[0.14] text-amber-400 ring-amber-500/[0.22]",
};

export function RoleSwitcher() {
  const { role, setRole, mounted } = useRole();
  const [open, setOpen] = useState(false);

  if (!mounted) return null;

  const roles: DashboardRole[] = ["OPERATOR", "FLEET_MANAGER", "MAINTENANCE_TECH"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 ring-1 transition",
          ROLE_COLORS[role]
        )}
      >
        <span className="font-ui text-[0.58rem] font-semibold uppercase tracking-[0.14em]">
          {ROLE_LABELS[role]}
        </span>
        <ChevronDown size={10} className={clsx("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-1.5 w-44 rounded-[14px] border border-white/[0.08] bg-[#17181d] py-1.5 shadow-elevated">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setOpen(false); }}
                className={clsx(
                  "w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition hover:bg-white/[0.06]",
                  r === role ? "text-white" : "text-white/50"
                )}
              >
                <span
                  className={clsx(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    r === role ? "bg-ember" : "bg-white/20"
                  )}
                />
                <span className="font-ui text-[0.62rem] font-medium">{ROLE_LABELS[r]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
