import type { ReactNode } from "react";

export const metadata = {
  title: "HABITAT AI Designer — BlackCat Robotics",
  description: "Design your custom home with HABITAT AI. Conversational intake, floor plans, and instant quotes.",
};

export default function HabitatDesignLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--paper-2)] to-[var(--paper)]">
      {children}
    </div>
  );
}
