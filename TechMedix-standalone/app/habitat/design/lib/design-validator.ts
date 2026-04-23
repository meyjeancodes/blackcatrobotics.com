import type { DesignParams } from "./floor-plan-generator";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export function validateDesign(params: DesignParams): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (params.bedrooms && params.sqft) {
    const minSqft = params.bedrooms * 250;
    if (params.sqft < minSqft) {
      issues.push({
        field: "sqft",
        message: `${params.bedrooms} bedrooms need at least ${minSqft} sqft`,
        severity: "error",
      });
    }
  }

  if (params.budget_tier && params.sqft) {
    const tierRanges: Record<string, [number, number]> = {
      standard: [300, 1800],
      pro: [1200, 3500],
      signature: [2500, 8000],
    };
    const range = tierRanges[params.budget_tier];
    if (range && (params.sqft < range[0] || params.sqft > range[1])) {
      issues.push({
        field: "budget_tier",
        message: `${params.budget_tier} tier is designed for ${range[0]}-${range[1]} sqft`,
        severity: "warning",
      });
    }
  }

  if (params.site_type === "off-grid" || params.features?.includes("off-grid")) {
    const required = ["solar", "rainwater", "compost"];
    const missing = required.filter((f) => !params.features?.includes(f as never));
    if (missing.length) {
      issues.push({
        field: "features",
        message: `Off-grid requires: ${missing.join(", ")}`,
        severity: "warning",
      });
    }
  }

  if (params.stories && params.stories >= 3) {
    issues.push({
      field: "stories",
      message: "3+ stories requires structural engineering review",
      severity: "warning",
    });
  }

  return issues;
}
