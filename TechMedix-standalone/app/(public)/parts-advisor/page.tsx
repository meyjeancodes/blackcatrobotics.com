import { PartsAdvisor } from "@/components/parts-advisor/PartsAdvisorWidget";

export const metadata = {
  title: "Parts Advisor — BlackCat Robotics",
  description: "Find the right aftermarket part for your robot. Tell us about your platform and the issue.",
};

export default function PartsAdvisorPage() {
  return (
    <div className="min-h-screen bg-theme-18">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <p className="kicker">Parts Advisor</p>
          <h1 className="mt-2 font-header text-4xl leading-none tracking-[-0.04em] text-theme-primary">
            Find the right part
          </h1>
          <p className="mt-3 text-sm text-theme-50 max-w-xl mx-auto">
            Describe your robot platform and the symptom you're seeing. I'll match you with the right aftermarket parts from our catalog.
          </p>
        </div>
      </div>
      <PartsAdvisor />
    </div>
  );
}
