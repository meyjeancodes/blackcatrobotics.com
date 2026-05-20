import { ROICalculator } from "@/components/roi-calculator";

export default function ROIPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Fleet economics</p>
        <h1 className="mt-2 font-header text-3xl text-theme-primary">ROI & TCO Calculator</h1>
        <p className="mt-1.5 font-body text-sm text-theme-soft">
          5-year cost model, payback analysis, and BOM benchmarks vs. Chinese and Western supply chains.
        </p>
      </div>
      <ROICalculator />
    </div>
  );
}
