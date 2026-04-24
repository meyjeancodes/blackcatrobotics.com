import { createSupabaseServerClient, isSupabaseServerConfigured } from "../../../lib/supabase-server";
import { JobList } from "./JobList";
import type { Job } from "../../../types/atlas";

export const revalidate = 30;

export default async function MaintenancePage() {
  let jobList: Job[] = [];

  if (isSupabaseServerConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data: jobs } = await supabase
          .from("jobs")
          .select(
            `*, procedures ( id, title, procedure_type, steps, estimated_minutes, ai_guidance_enabled ),
             components ( id, name, type, criticality, description )`
          )
          .order("created_at", { ascending: false });
        jobList = (jobs ?? []) as Job[];
      }
    } catch {
      // Non-fatal: render empty state
    }
  }

  const pending = jobList.filter((j) => j.status === "pending").length;
  const inProgress = jobList.filter((j) => j.status === "in_progress").length;
  const completed = jobList.filter((j) => j.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Maintenance Operations</p>
        <h1 className="font-header text-2xl tracking-[-0.03em] text-theme-primary mt-0.5">Jobs</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel px-5 py-4">
          <p className="kicker">Pending</p>
          <p className="mt-1 text-3xl font-header tracking-[-0.04em] text-amber-600">{pending}</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">In Progress</p>
          <p className="mt-1 text-3xl font-header tracking-[-0.04em] text-sky-600">{inProgress}</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="kicker">Completed</p>
          <p className="mt-1 text-3xl font-header tracking-[-0.04em] text-emerald-600">{completed}</p>
        </div>
      </section>

      <JobList initialJobs={jobList} />
    </div>
  );
}
