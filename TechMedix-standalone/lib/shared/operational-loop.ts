// Client-side only — localStorage-backed operational state for the alert→dispatch→compliance loop

export interface LoopJob {
  id: string;
  alertId: string;
  alertTitle: string;
  robotName: string;
  robotId: string;
  severity: string;
  region: string;
  techName: string;
  techId: string;
  createdAt: string;
  status: "open" | "assigned" | "complete";
}

export interface LoopComplianceEntry {
  id: string;
  jobId: string;
  robotName: string;
  techName: string;
  action: string;
  standard: string;
  result: "pass" | "flag";
  closedAt: string;
}

const JOBS_KEY = "tm_loop_jobs";
const COMPLIANCE_KEY = "tm_loop_compliance";

const TECHS = [
  { name: "Marcus Chen",  id: "tech_mchen"  },
  { name: "Priya Patel",  id: "tech_ppatel" },
  { name: "Jordan Ellis", id: "tech_jellis" },
  { name: "Sofia Reyes",  id: "tech_sreyes" },
];

export function getLoopJobs(): LoopJob[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(JOBS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isAlertDispatched(alertId: string): LoopJob | undefined {
  return getLoopJobs().find((j) => j.alertId === alertId);
}

export function createLoopJob(
  alertId: string,
  alertTitle: string,
  robotName: string,
  robotId: string,
  severity: string,
  region: string
): LoopJob {
  const tech = TECHS[Math.floor(Math.random() * TECHS.length)];
  const job: LoopJob = {
    id: `JOB-${Math.floor(Math.random() * 90000) + 10000}`,
    alertId,
    alertTitle,
    robotName,
    robotId,
    severity,
    region,
    techName: tech.name,
    techId: tech.id,
    createdAt: new Date().toISOString(),
    status: "assigned",
  };
  const jobs = getLoopJobs();
  jobs.push(job);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return job;
}

export function closeLoopJob(jobId: string): LoopComplianceEntry | null {
  const jobs = getLoopJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  job.status = "complete";
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));

  const entry: LoopComplianceEntry = {
    id: `CE-${Date.now()}`,
    jobId,
    robotName: job.robotName,
    techName: job.techName,
    action: `Field repair — ${job.alertTitle}`,
    standard: job.severity === "critical" ? "ISO 10218-1" : "OSHA 29 CFR 1910.147",
    result: "pass",
    closedAt: new Date().toISOString(),
  };

  const entries = getLoopComplianceEntries();
  entries.unshift(entry);
  localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(entries));
  return entry;
}

export function getLoopComplianceEntries(): LoopComplianceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COMPLIANCE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
