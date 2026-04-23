"use client";

import { useMemo } from "react";
import { generateFloorPlan, floorPlanToSvg, type DesignParams } from "../lib/floor-plan-generator";
import { validateDesign, type ValidationIssue } from "../lib/design-validator";

interface DesignCanvasProps {
  params: Partial<DesignParams>;
}

export function DesignCanvas({ params }: DesignCanvasProps) {
  const { svg, issues, plan } = useMemo(() => {
    const full: DesignParams = {
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      stories: 1,
      style: "modern",
      ...params,
    };
    const plan = generateFloorPlan(full);
    const svg = floorPlanToSvg(plan);
    const issues = validateDesign(full);
    return { svg, issues, plan };
  }, [params]);

  const hasErrors = issues.some((i) => i.severity === "error");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="kicker">Floor plan</p>
          <h2 className="mt-1 font-header text-xl leading-tight text-theme-primary">
            Generated Layout
          </h2>
        </div>
        <div className="text-right">
          <p className="font-ui text-[0.60rem] uppercase tracking-[0.16em] text-theme-50">
            {plan.width * 2}' x {plan.height * 2}' &middot; {Math.round(plan.width * plan.height * 4).toLocaleString()} sqft
          </p>
        </div>
      </div>

      {hasErrors && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold text-red-700 mb-1">Design issues detected</p>
          <ul className="space-y-1">
            {issues.filter((i) => i.severity === "error").map((issue, idx) => (
              <li key={idx} className="text-xs text-red-600">{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      {issues.filter((i) => i.severity === "warning").length > 0 && (
        <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Recommendations</p>
          <ul className="space-y-1">
            {issues.filter((i) => i.severity === "warning").map((issue, idx) => (
              <li key={idx} className="text-xs text-amber-700">{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="rounded-[20px] border border-theme-6 overflow-hidden"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
