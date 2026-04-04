/**
 * DJI Care Refresh Coverage Engine
 *
 * Encodes the coverage rules extracted from DJI Care Refresh documentation.
 * Source: /tmp/dji_recon/dji_care_analysis.md (generated from DJI support pages)
 *
 * TODO: Verify all prices at https://store.dji.com/service/djicare-refresh
 * TODO: Confirm per-model activation windows — DJI updates these periodically
 * TODO: Verify current flyaway coverage availability per model
 */

import type { CareRefreshPlan, DamageType } from "../types/dji-drone";

// ─── Plan Definitions ─────────────────────────────────────────────────────────

export interface CarePlanDefinition {
  duration_months: number;
  replacements_included: number;
  covers: {
    collision: boolean;
    water_damage: boolean;
    flyaway: boolean;
    signal_loss: boolean;
    accidental_damage: boolean;
  };
  exclusions: string[];
  activation_window_days: number; // days after drone purchase/activation
  notes: string;
}

export const DJI_CARE_REFRESH_PLANS: Record<Exclude<CareRefreshPlan, "NONE">, CarePlanDefinition> = {
  ONE_YEAR: {
    duration_months: 12,
    replacements_included: 2,
    covers: {
      collision: true,
      water_damage: true,
      flyaway: false,        // Requires COMBO / Care Refresh+
      signal_loss: false,    // Signal loss alone not covered — flyaway add-on needed
      accidental_damage: true,
    },
    exclusions: [
      "Intentional damage",
      "Theft or loss (without flyaway coverage)",
      "Flyaway without Care Refresh+ add-on",
      "Third-party hardware or firmware modifications",
      "Battery degradation and normal capacity loss",
      "Normal wear and tear (scratches, worn propellers from normal use)",
      "Cosmetic damage without functional impairment",
      "Accessories and spare parts (propellers, cables, chargers, cases)",
      "Damage after plan expiration",
      "Flying in restricted/no-fly zones",
      "Exceeding rated specifications (payload, altitude, temperature)",
      "Natural disasters (except where water damage clause applies)",
      "Removed or altered serial numbers",
      "Unauthorized prior repair",
      "Software/firmware issues not caused by physical damage",
      "Damage exceeding replacement limit (2 units per plan period)",
    ],
    activation_window_days: 48, // 48 hours from drone activation/first flight
    notes: "Standard plan. Does not include flyaway. Activate within 48 hours of first flight.",
  },

  TWO_YEAR: {
    duration_months: 24,
    replacements_included: 3,
    covers: {
      collision: true,
      water_damage: true,
      flyaway: false,
      signal_loss: false,
      accidental_damage: true,
    },
    exclusions: [
      "Intentional damage",
      "Theft or loss (without flyaway coverage)",
      "Flyaway without Care Refresh+ add-on",
      "Third-party hardware or firmware modifications",
      "Battery degradation and normal capacity loss",
      "Normal wear and tear",
      "Cosmetic damage without functional impairment",
      "Accessories and spare parts",
      "Damage after plan expiration",
      "Flying in restricted/no-fly zones",
      "Exceeding rated specifications",
      "Natural disasters (except water damage clause)",
      "Removed or altered serial numbers",
      "Unauthorized prior repair",
      "Software/firmware issues not caused by physical damage",
      "Damage exceeding replacement limit (3 units per plan period)",
    ],
    activation_window_days: 48,
    notes: "Extended plan. Same exclusions as 1-Year. Three replacements over 24 months.",
  },

  COMBO: {
    duration_months: 12, // Base is 1-year; TODO: 2-year+combo also exists
    replacements_included: 2,
    covers: {
      collision: true,
      water_damage: true,
      flyaway: true,        // Care Refresh+ adds flyaway
      signal_loss: true,    // Signal loss leading to flyaway covered
      accidental_damage: true,
    },
    exclusions: [
      "Intentional damage",
      "Theft (not flyaway — must have flight records)",
      "Flyaway without flight records from DJI Fly/GO app",
      "Third-party hardware or firmware modifications",
      "Battery degradation and normal capacity loss",
      "Normal wear and tear",
      "Cosmetic damage without functional impairment",
      "Accessories and spare parts",
      "Damage after plan expiration",
      "Flying in restricted/no-fly zones",
      "Exceeding rated specifications",
      "Natural disasters (except water damage clause)",
      "Removed or altered serial numbers",
      "Unauthorized prior repair",
      "Software/firmware issues not caused by physical damage",
      "Damage exceeding replacement limit",
    ],
    activation_window_days: 48,
    notes:
      "Care Refresh+ (Combo). Adds flyaway protection. Flyaway claims require GPS flight records from DJI Fly app. Replacements shared — flyaway uses the same 2-replacement pool.",
  },
};

// ─── Replacement Fees (Approximate — TODO: verify at store.dji.com) ──────────

export interface ModelPricing {
  plan_1yr_usd: number;
  plan_2yr_usd: number;
  combo_addon_usd: number; // Add-on cost on top of base plan for flyaway
  replacement_fee_usd: number;
}

// TODO: Replace all pricing with verified current values from DJI store
export const DJI_MODEL_PRICING: Record<string, ModelPricing> = {
  "DJI Mini 4 Pro":           { plan_1yr_usd: 79,   plan_2yr_usd: 139,  combo_addon_usd: 49,  replacement_fee_usd: 99  },
  "DJI Mini 3 Pro":           { plan_1yr_usd: 79,   plan_2yr_usd: 139,  combo_addon_usd: 49,  replacement_fee_usd: 99  },
  "DJI Mini 3":               { plan_1yr_usd: 59,   plan_2yr_usd: 99,   combo_addon_usd: 39,  replacement_fee_usd: 79  },
  "DJI Mini 2 SE":            { plan_1yr_usd: 49,   plan_2yr_usd: 89,   combo_addon_usd: 29,  replacement_fee_usd: 69  },
  "DJI Air 3":                { plan_1yr_usd: 99,   plan_2yr_usd: 169,  combo_addon_usd: 59,  replacement_fee_usd: 119 },
  "DJI Air 3S":               { plan_1yr_usd: 119,  plan_2yr_usd: 199,  combo_addon_usd: 59,  replacement_fee_usd: 139 },
  "DJI Air 2S":               { plan_1yr_usd: 79,   plan_2yr_usd: 139,  combo_addon_usd: 49,  replacement_fee_usd: 109 },
  "DJI Mavic 3 Pro":          { plan_1yr_usd: 199,  plan_2yr_usd: 339,  combo_addon_usd: 79,  replacement_fee_usd: 259 },
  "DJI Mavic 3 Pro Cine":     { plan_1yr_usd: 249,  plan_2yr_usd: 419,  combo_addon_usd: 99,  replacement_fee_usd: 349 },
  "DJI Mavic 3 Classic":      { plan_1yr_usd: 149,  plan_2yr_usd: 249,  combo_addon_usd: 69,  replacement_fee_usd: 199 },
  "DJI Mavic 3":              { plan_1yr_usd: 179,  plan_2yr_usd: 299,  combo_addon_usd: 79,  replacement_fee_usd: 199 },
  "DJI Avata 2":              { plan_1yr_usd: 119,  plan_2yr_usd: 199,  combo_addon_usd: 59,  replacement_fee_usd: 149 },
  "DJI Avata":                { plan_1yr_usd: 99,   plan_2yr_usd: 169,  combo_addon_usd: 49,  replacement_fee_usd: 129 },
  "DJI FPV":                  { plan_1yr_usd: 99,   plan_2yr_usd: 169,  combo_addon_usd: 49,  replacement_fee_usd: 149 },
  "DJI Inspire 3":            { plan_1yr_usd: 799,  plan_2yr_usd: 1299, combo_addon_usd: 199, replacement_fee_usd: 499 },
  "DJI Inspire 2":            { plan_1yr_usd: 499,  plan_2yr_usd: 849,  combo_addon_usd: 149, replacement_fee_usd: 349 },
  "DJI Matrice 350 RTK":      { plan_1yr_usd: 1299, plan_2yr_usd: 2199, combo_addon_usd: 399, replacement_fee_usd: 699 },
  "DJI Matrice 300 RTK":      { plan_1yr_usd: 999,  plan_2yr_usd: 1699, combo_addon_usd: 299, replacement_fee_usd: 549 },
  "DJI Matrice 30":           { plan_1yr_usd: 599,  plan_2yr_usd: 999,  combo_addon_usd: 199, replacement_fee_usd: 399 },
  "DJI Matrice 30T":          { plan_1yr_usd: 699,  plan_2yr_usd: 1199, combo_addon_usd: 229, replacement_fee_usd: 449 },
  "DJI Agras T50":            { plan_1yr_usd: 1499, plan_2yr_usd: 2499, combo_addon_usd: 499, replacement_fee_usd: 799 },
  "DJI Agras T60":            { plan_1yr_usd: 1799, plan_2yr_usd: 2999, combo_addon_usd: 599, replacement_fee_usd: 999 },
  "DJI Agras T25":            { plan_1yr_usd: 999,  plan_2yr_usd: 1699, combo_addon_usd: 349, replacement_fee_usd: 549 },
  "DJI Agras T10":            { plan_1yr_usd: 599,  plan_2yr_usd: 999,  combo_addon_usd: 199, replacement_fee_usd: 349 },
};

// ─── Supported Models List ────────────────────────────────────────────────────

export const SUPPORTED_DJI_MODELS: string[] = Object.keys(DJI_MODEL_PRICING);

// ─── Coverage Check Functions ─────────────────────────────────────────────────

export interface CoverageCheckResult {
  covered: boolean;
  reason: string;
  replacement_fee_usd?: number;
  requires_flight_log?: boolean;
  plan_notes?: string;
}

export function checkCoverage(
  plan: CareRefreshPlan,
  damage_type: DamageType,
  drone_model?: string
): CoverageCheckResult {
  if (plan === "NONE") {
    return {
      covered: false,
      reason: "No DJI Care Refresh plan is active for this drone.",
    };
  }

  const planDef = DJI_CARE_REFRESH_PLANS[plan];
  const pricing = drone_model ? DJI_MODEL_PRICING[drone_model] : undefined;

  switch (damage_type) {
    case "COLLISION":
      return {
        covered: planDef.covers.collision,
        reason: planDef.covers.collision
          ? "Collision damage is covered under your Care Refresh plan."
          : "Collision damage is not covered under your current plan.",
        replacement_fee_usd: pricing?.replacement_fee_usd,
        plan_notes: planDef.notes,
      };

    case "WATER":
      return {
        covered: planDef.covers.water_damage,
        reason: planDef.covers.water_damage
          ? "Water damage is covered under your Care Refresh plan."
          : "Water damage is not covered under your current plan.",
        replacement_fee_usd: pricing?.replacement_fee_usd,
        plan_notes: planDef.notes,
      };

    case "FLYAWAY":
      return {
        covered: planDef.covers.flyaway,
        reason: planDef.covers.flyaway
          ? "Flyaway is covered under your Care Refresh+ plan. Flight records from DJI Fly app are required."
          : "Flyaway is NOT covered under your current plan. You need DJI Care Refresh+ (Combo) for flyaway protection.",
        replacement_fee_usd: planDef.covers.flyaway ? pricing?.replacement_fee_usd : undefined,
        requires_flight_log: planDef.covers.flyaway,
        plan_notes: planDef.covers.flyaway
          ? "Flight records showing GPS path and signal loss event are required."
          : "Upgrade to Care Refresh+ (Combo plan) to add flyaway coverage.",
      };

    case "SIGNAL_LOSS":
      return {
        covered: planDef.covers.signal_loss,
        reason: planDef.covers.signal_loss
          ? "Signal loss leading to flyaway is covered under your Care Refresh+ plan."
          : "Signal loss alone is not covered. If the drone was lost (flyaway), upgrade to Care Refresh+ (Combo) plan.",
        replacement_fee_usd: planDef.covers.signal_loss ? pricing?.replacement_fee_usd : undefined,
        requires_flight_log: planDef.covers.signal_loss,
        plan_notes: planDef.covers.signal_loss
          ? "Submit flight records showing signal degradation and loss event."
          : "Signal loss damage is covered only if it results in flyaway AND you have Care Refresh+.",
      };

    case "OTHER":
      return {
        covered: planDef.covers.accidental_damage,
        reason: planDef.covers.accidental_damage
          ? "Accidental damage may be covered — coverage is assessed per incident. Submit with detailed photos and description."
          : "Other damage types may not be covered — contact DJI Support to verify.",
        replacement_fee_usd: pricing?.replacement_fee_usd,
        plan_notes: "DJI reviews 'Other' damage claims on a case-by-case basis.",
      };

    default:
      return {
        covered: false,
        reason: "Unknown damage type — contact DJI Support directly.",
      };
  }
}

// ─── Activation Eligibility ───────────────────────────────────────────────────

export interface ActivationEligibilityResult {
  eligible: boolean;
  days_remaining: number;
  deadline: Date;
  message: string;
}

export function isEligibleForActivation(
  purchase_date: Date,
  plan: Exclude<CareRefreshPlan, "NONE">
): ActivationEligibilityResult {
  const planDef = DJI_CARE_REFRESH_PLANS[plan];
  const windowMs = planDef.activation_window_days * 24 * 60 * 60 * 1000;
  const deadline = new Date(purchase_date.getTime() + windowMs);
  const now = new Date();
  const msRemaining = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const eligible = msRemaining > 0;

  return {
    eligible,
    days_remaining: Math.max(0, daysRemaining),
    deadline,
    message: eligible
      ? `Eligible for activation. ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining (deadline: ${deadline.toLocaleDateString()}).`
      : `Activation window has passed. DJI Care Refresh must be activated within ${planDef.activation_window_days} hours of drone activation.`,
  };
}

// ─── Expiry Warning ───────────────────────────────────────────────────────────

export interface ExpiryWarningResult {
  warning: boolean;
  days_remaining: number;
  message: string;
  urgency: "critical" | "warning" | "info" | "none";
}

export function getExpiryWarning(expires_at: Date): ExpiryWarningResult {
  const now = new Date();
  const msRemaining = expires_at.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  if (msRemaining <= 0) {
    return {
      warning: true,
      days_remaining: 0,
      message: "DJI Care Refresh plan has expired. This drone is no longer covered.",
      urgency: "critical",
    };
  }

  if (daysRemaining <= 7) {
    return {
      warning: true,
      days_remaining: daysRemaining,
      message: `Care Refresh expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}! Renew immediately to avoid coverage gap.`,
      urgency: "critical",
    };
  }

  if (daysRemaining <= 30) {
    return {
      warning: true,
      days_remaining: daysRemaining,
      message: `Care Refresh expires in ${daysRemaining} days. Consider renewing soon.`,
      urgency: "warning",
    };
  }

  if (daysRemaining <= 60) {
    return {
      warning: false,
      days_remaining: daysRemaining,
      message: `Care Refresh expires in ${daysRemaining} days.`,
      urgency: "info",
    };
  }

  return {
    warning: false,
    days_remaining: daysRemaining,
    message: `Care Refresh active for ${daysRemaining} more days.`,
    urgency: "none",
  };
}

// ─── Coverage Summary (for UI display) ───────────────────────────────────────

export interface CoverageSummaryItem {
  label: string;
  covered: boolean;
  note: string;
}

export function getCoverageSummary(plan: CareRefreshPlan): CoverageSummaryItem[] {
  if (plan === "NONE") {
    return [
      { label: "Collision Damage",  covered: false, note: "No plan active" },
      { label: "Water Damage",      covered: false, note: "No plan active" },
      { label: "Flyaway",           covered: false, note: "Requires Care Refresh+" },
      { label: "Signal Loss",       covered: false, note: "Requires Care Refresh+" },
      { label: "Accidental Damage", covered: false, note: "No plan active" },
    ];
  }

  const planDef = DJI_CARE_REFRESH_PLANS[plan];
  return [
    { label: "Collision Damage",  covered: planDef.covers.collision,         note: planDef.covers.collision ? "Up to replacement limit" : "Not covered" },
    { label: "Water Damage",      covered: planDef.covers.water_damage,      note: planDef.covers.water_damage ? "Up to replacement limit" : "Not covered" },
    { label: "Flyaway",           covered: planDef.covers.flyaway,           note: planDef.covers.flyaway ? "Flight records required" : "Upgrade to Care Refresh+" },
    { label: "Signal Loss",       covered: planDef.covers.signal_loss,       note: planDef.covers.signal_loss ? "Flight records required" : "Only via flyaway add-on" },
    { label: "Accidental Damage", covered: planDef.covers.accidental_damage, note: planDef.covers.accidental_damage ? "Case-by-case review" : "Not covered" },
    { label: "Battery Degradation", covered: false, note: "Never covered by DJI Care Refresh" },
    { label: "Intentional Damage",  covered: false, note: "Never covered by DJI Care Refresh" },
    { label: "3rd-Party Mods",      covered: false, note: "Voids coverage entirely" },
  ];
}

/*
 * ─── SQL MIGRATION ────────────────────────────────────────────────────────────
 *
 * Run the following in your Supabase SQL editor to create drone tables:
 *
 * -- DJI Drone fleet
 * CREATE TABLE dji_drones (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   serial_number TEXT NOT NULL,
 *   model TEXT NOT NULL,
 *   purchase_date DATE NOT NULL,
 *   care_refresh_plan TEXT NOT NULL DEFAULT 'NONE',
 *   care_refresh_activated_at TIMESTAMPTZ,
 *   care_refresh_expires_at TIMESTAMPTZ,
 *   replacements_used INT NOT NULL DEFAULT 0,
 *   replacements_remaining INT NOT NULL DEFAULT 0,
 *   fleet_id UUID,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Flight logs
 * CREATE TABLE drone_flight_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   drone_id UUID REFERENCES dji_drones(id) ON DELETE CASCADE,
 *   flight_date TIMESTAMPTZ NOT NULL,
 *   duration_minutes NUMERIC NOT NULL,
 *   max_altitude_m NUMERIC NOT NULL DEFAULT 0,
 *   max_speed_ms NUMERIC NOT NULL DEFAULT 0,
 *   distance_km NUMERIC NOT NULL DEFAULT 0,
 *   battery_start_pct INT NOT NULL DEFAULT 100,
 *   battery_end_pct INT NOT NULL DEFAULT 0,
 *   signal_quality_avg NUMERIC NOT NULL DEFAULT 100,
 *   incidents JSONB NOT NULL DEFAULT '[]',
 *   raw_log_path TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Diagnostic reports
 * CREATE TABLE drone_diagnostic_reports (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   drone_id UUID REFERENCES dji_drones(id) ON DELETE CASCADE,
 *   generated_at TIMESTAMPTZ DEFAULT NOW(),
 *   overall_health_score INT NOT NULL DEFAULT 0,
 *   battery_health_score INT NOT NULL DEFAULT 0,
 *   motor_health_score JSONB NOT NULL DEFAULT '{}',
 *   gimbal_health_score INT NOT NULL DEFAULT 0,
 *   signal_health_score INT NOT NULL DEFAULT 0,
 *   propeller_condition TEXT NOT NULL DEFAULT 'GOOD',
 *   techmedix_alerts JSONB NOT NULL DEFAULT '[]',
 *   care_refresh_eligible BOOLEAN NOT NULL DEFAULT false,
 *   recommended_action TEXT NOT NULL DEFAULT 'MONITOR',
 *   report_data JSONB NOT NULL DEFAULT '{}'
 * );
 *
 * -- Care Refresh claims
 * CREATE TABLE drone_care_refresh_claims (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   drone_id UUID REFERENCES dji_drones(id) ON DELETE CASCADE,
 *   claim_date TIMESTAMPTZ DEFAULT NOW(),
 *   damage_type TEXT NOT NULL,
 *   damage_description TEXT NOT NULL DEFAULT '',
 *   flight_log_id UUID REFERENCES drone_flight_logs(id),
 *   photos_uploaded JSONB NOT NULL DEFAULT '[]',
 *   claim_status TEXT NOT NULL DEFAULT 'DRAFT',
 *   replacement_serial TEXT,
 *   resolution_notes TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */
