"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { getLoopJobs, closeLoopJob, type LoopJob } from "../lib/shared/operational-loop";

export function DispatchLoopPanel() {
  const [jobs, setJobs] = useState<LoopJob[]>([]);
  const [closing, setClosing] = useState<string | null>(null);
  const [justClosed, setJustClosed] = useState<string | null>(null);

  useEffect(() => {
    setJobs(getLoopJobs());
  }, []);

  const active = jobs.filter((j) => j.status !== "complete");

  if (active.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-theme-10 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-theme-4">
          <ClipboardCheck size={16} className="text-theme-35" />
        </div>
        <p className="font-header text-base text-theme-primary">No active loop jobs</p>
        <p className="mt-1 text-sm text-theme-45">
          Go to the{" "}
          <Link href="/alerts" className="text-ember underline-offset-2 hover:underline">
            Alert Center
          </Link>{" "}
          and tap <strong>Dispatch</strong> on any alert to create a job here.
        </p>
      </div>
    );
  }

  function handleClose(jobId: string) {
    setClosing(jobId);
    setTimeout(() => {
      closeLoopJob(jobId);
      setJobs(getLoopJobs());
      setClosing(null);
      setJustClosed(jobId);
      setTimeout(() => setJustClosed(null), 3000);
    }, 900);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="kicker">Live Loop</p>
          <h3 className="font-header text-lg leading-tight text-theme-primary">
            Alert-Dispatched Jobs
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ember/10 border border-ember/20 px-3 py-1 font-ui text-[0.52rem] uppercase tracking-[0.14em] font-semibold text-ember">
          <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse" />
          {active.length} active
        </span>
      </div>

      {justClosed && (
        <div className="flex items-center gap-2 rounded-[14px] bg-emerald-50 border border-emerald-200/60 px-4 py-3">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="font-ui text-[0.58rem] uppercase tracking-[0.14em] font-semibold text-emerald-700">
            Job closed · Compliance log updated
          </p>
          <Link
            href="/compliance"
            className="ml-auto flex items-center gap-1 font-ui text-[0.52rem] uppercase tracking-[0.12em] text-emerald-600 hover:text-emerald-800"
          >
            View Compliance <ArrowRight size={9} />
          </Link>
        </div>
      )}

      {active.map((job) => (
        <div
          key={job.id}
          className="rounded-[18px] border border-theme-5 bg-theme-2 p-4 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[0.56rem] text-theme-35">{job.id}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-ui text-[0.44rem] uppercase tracking-[0.10em] font-semibold ${
                  job.severity === "critical"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-amber-400/10 text-amber-700"
                }`}
              >
                {job.severity}
              </span>
            </div>
            <p className="font-ui text-[0.68rem] font-semibold text-theme-primary">{job.alertTitle}</p>
            <p className="mt-0.5 font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-40">
              {job.robotName} · {job.techName} · {job.region}
            </p>
          </div>

          <button
            onClick={() => handleClose(job.id)}
            disabled={closing === job.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-theme-primary/90 px-4 py-2 font-ui text-[0.56rem] uppercase tracking-[0.14em] font-semibold text-white transition hover:bg-ember disabled:opacity-50"
          >
            {closing === job.id ? (
              <><Loader2 size={11} className="animate-spin" /> Closing…</>
            ) : (
              <><ClipboardCheck size={11} /> Mark Complete</>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
