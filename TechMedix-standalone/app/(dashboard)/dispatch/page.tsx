import { SurfaceCard } from "../../../components/surface-card";
import { StatusPill } from "../../../components/status-pill";
import { getDashboardData } from "../../../lib/data";
import { DispatchJobCard } from "./DispatchJobCard";

export default async function DispatchPage() {
  const { snapshot } = await getDashboardData();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SurfaceCard title="Dispatch board" eyebrow="Jobs and ETAs">
        <div className="space-y-4">
          {snapshot.jobs.map((job) => {
            const robot = snapshot.robots.find((entry) => entry.id === job.robotId);
            const tech = snapshot.technicians.find((entry) => entry.id === job.technicianId);
            return (
              <DispatchJobCard
                key={job.id}
                job={job}
                robotName={robot?.name ?? "Unknown robot"}
                techName={tech?.name ?? "Unassigned"}
              />
            );
          })}
        </div>
      </SurfaceCard>

      <SurfaceCard title="Available technicians" eyebrow="Routing candidates" dark>
        <div className="space-y-4">
          {snapshot.technicians.map((tech) => (
            <div key={tech.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{tech.name}</h3>
                  <p className="mt-1 text-sm text-white/60">{tech.region} · {tech.platforms.join(", ")}</p>
                </div>
                <StatusPill label={tech.available ? "active" : "open"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-white/55">
                <span>Rating: {tech.rating.toFixed(1)}</span>
                <span>ETA: {tech.etaMinutes} min</span>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
