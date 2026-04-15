"use client";

import { Shield, ShieldAlert, ShieldOff, ExternalLink, Check, X } from "lucide-react";
import { getCoverageSummary, getExpiryWarning, DJI_CARE_REFRESH_PLANS } from "../../lib/dji-care-coverage";
import type { DjiDrone, CareRefreshPlan } from "../../types/dji-drone";

interface CareRefreshStatusCardProps {
  drone: DjiDrone;
  onActivatePlan?: () => void;
  onFileClaim?: () => void;
}

export function CareRefreshStatusCard({
  drone,
  onActivatePlan,
  onFileClaim,
}: CareRefreshStatusCardProps) {
  const plan = drone.care_refresh_plan;
  const coverageSummary = getCoverageSummary(plan);
  const isActive = plan !== "NONE" && drone.care_refresh_expires_at;
  const expiryWarning = drone.care_refresh_expires_at
    ? getExpiryWarning(new Date(drone.care_refresh_expires_at))
    : null;

  const planDef = plan !== "NONE" ? DJI_CARE_REFRESH_PLANS[plan as Exclude<CareRefreshPlan, "NONE">] : null;
  const totalReplacements = planDef ? planDef.replacements_included : 0;
  const replacementsUsed = drone.replacements_used;
  const replacementsRemaining = drone.replacements_remaining;

  const expiryUrgency = expiryWarning?.urgency;
  const expiryBorderColor =
    expiryUrgency === "critical" ? "border-[#e8601e]/30" :
    expiryUrgency === "warning" ? "border-amber-400/30" :
    "border-theme-6";

  return (
    <div className={`panel p-6 border-2 ${expiryBorderColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="kicker">DJI Care Refresh</p>
          <h3 className="mt-1.5 font-header text-xl text-theme-primary">Coverage Status</h3>
        </div>
        {plan === "NONE" ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-theme-4">
            <ShieldOff size={18} className="text-theme-30" />
          </div>
        ) : expiryUrgency === "critical" ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8601e]/10">
            <ShieldAlert size={18} className="text-[#e8601e]" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1db87a]/10">
            <Shield size={18} className="text-[#1db87a]" />
          </div>
        )}
      </div>

      {/* Plan info */}
      {plan === "NONE" ? (
        <div className="mb-5 rounded-[20px] bg-theme-3 border border-theme-5 p-4">
          <p className="text-sm text-theme-55 leading-relaxed">
            No DJI Care Refresh plan is active for this drone. Without coverage, repair or replacement costs are fully out-of-pocket.
          </p>
          {onActivatePlan && (
            <button
              onClick={onActivatePlan}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e8601e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d4521a] transition-colors"
            >
              Activate Care Refresh
              <ExternalLink size={11} />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Plan details */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-[16px] bg-theme-3 border border-theme-5 p-3">
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-35 mb-1">Plan</p>
              <p className="text-sm font-semibold text-theme-primary">
                {plan === "COMBO" ? "Care Refresh+" : plan === "TWO_YEAR" ? "2-Year" : "1-Year"}
              </p>
            </div>
            <div className="rounded-[16px] bg-theme-3 border border-theme-5 p-3">
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-35 mb-1">Expires</p>
              <p className={`text-sm font-semibold ${expiryUrgency === "critical" ? "text-[#e8601e]" : "text-theme-primary"}`}>
                {drone.care_refresh_expires_at
                  ? new Date(drone.care_refresh_expires_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div className="rounded-[16px] bg-theme-3 border border-theme-5 p-3">
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-35 mb-1">Activated</p>
              <p className="text-sm font-semibold text-theme-primary">
                {drone.care_refresh_activated_at
                  ? new Date(drone.care_refresh_activated_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div className="rounded-[16px] bg-theme-3 border border-theme-5 p-3">
              <p className="font-ui text-[0.58rem] uppercase tracking-[0.18em] text-theme-35 mb-1">Replacements</p>
              <p className="text-sm font-semibold text-theme-primary">
                {replacementsUsed}/{totalReplacements} used
              </p>
            </div>
          </div>

          {/* Replacements progress bar */}
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40">Replacement Units</span>
              <span className="font-ui text-[0.60rem] text-theme-50">{replacementsRemaining} remaining</span>
            </div>
            <div className="h-2 w-full rounded-full bg-theme-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1db87a] transition-all duration-500"
                style={{ width: `${totalReplacements > 0 ? (replacementsRemaining / totalReplacements) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Expiry warning */}
          {expiryWarning?.warning && (
            <div className={`mb-4 rounded-[16px] border p-3 text-sm ${
              expiryUrgency === "critical"
                ? "bg-[#e8601e]/[0.06] border-[#e8601e]/20 text-[#e8601e]"
                : "bg-amber-500/[0.06] border-amber-500/20 text-amber-700"
            }`}>
              {expiryWarning.message}
            </div>
          )}
        </>
      )}

      {/* Coverage checklist */}
      <div className="mb-5">
        <p className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-40 mb-3">Coverage Details</p>
        <div className="space-y-2">
          {coverageSummary.map((item) => (
            <div key={item.label} className="flex items-start gap-2.5">
              <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                item.covered ? "bg-[#1db87a]/10" : "bg-theme-4"
              }`}>
                {item.covered ? (
                  <Check size={10} className="text-[#1db87a]" />
                ) : (
                  <X size={10} className="text-theme-25" />
                )}
              </div>
              <div>
                <span className={`text-xs font-medium ${item.covered ? "text-theme-75" : "text-theme-35"}`}>
                  {item.label}
                </span>
                <span className="ml-1.5 text-[0.65rem] text-theme-30">{item.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-theme-5 pt-4">
        {isActive && replacementsRemaining > 0 && onFileClaim && (
          <button
            onClick={onFileClaim}
            className="inline-flex items-center gap-2 rounded-full bg-[#e8601e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d4521a] transition-colors"
          >
            File New Claim
          </button>
        )}
        <a
          href="https://store.dji.com/service/djicare-refresh"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-4 py-2 text-xs font-medium text-theme-60 hover:border-theme-10 hover:text-theme-primary/80 transition-colors"
        >
          DJI Care Refresh ↗
          <ExternalLink size={10} />
        </a>
      </div>

      {/* TODO note */}
      <p className="mt-3 text-[0.58rem] text-theme-25 font-ui">
        {/* TODO: Verify current pricing at store.dji.com — shown prices are approximate */}
      </p>
    </div>
  );
}
