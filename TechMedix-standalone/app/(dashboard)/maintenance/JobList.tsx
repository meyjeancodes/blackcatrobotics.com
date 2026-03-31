"use client";

import { useState } from "react";
import type { Job, ProcedureStep, JobStatus } from "../../../types/atlas";
import { X, Zap, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
};

const CRIT_COLORS: Record<string, string> = {
  high: "text-rose-600",
  medium: "text-amber-600",
  low: "text-zinc-400",
};

export function JobList({ initialJobs }: { initialJobs: Job[] }) {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);

  const filtered =
    statusFilter === "all"
      ? initialJobs
      : initialJobs.filter((j) => j.status === statusFilter);

  async function fetchGuidance(job: Job, stepIdx: number) {
    if (!job.procedures) return;
    const step = (job.procedures.steps as ProcedureStep[])[stepIdx];
    if (!step) return;

    setGuidanceLoading(true);
    setGuidance(null);
    try {
      const res = await fetch("/api/ar-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_instruction: step.instruction,
          component_name: job.components?.name ?? "Component",
          warnings: step.warning ? [step.warning] : [],
        }),
      });
      const data = await res.json();
      setGuidance(data.guidance ?? "No guidance available.");
    } catch {
      setGuidance("AI guidance unavailable.");
    } finally {
      setGuidanceLoading(false);
    }
  }

  function openJob(job: Job) {
    setSelectedJob(job);
    setActiveStep(0);
    setGuidance(null);
  }

  const steps = selectedJob?.procedures
    ? (selectedJob.procedures.steps as ProcedureStep[])
    : [];

  return (
    <div className="flex gap-6 items-start">
      {/* Job list */}
      <div className="flex-1 min-w-0">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "pending", "in_progress", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === s
                  ? "bg-black text-white border-black"
                  : "border-black/10 text-zinc-600 hover:border-black/20"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="panel px-5 py-10 text-center text-zinc-400 text-sm">
              No jobs found.
            </div>
          ) : (
            filtered.map((job) => {
              const steps = job.procedures
                ? (job.procedures.steps as ProcedureStep[])
                : [];
              return (
                <button
                  key={job.id}
                  onClick={() => openJob(job)}
                  className={`w-full text-left panel px-5 py-4 hover:shadow-md transition-shadow ${
                    selectedJob?.id === job.id ? "ring-2 ring-black/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full ${
                            STATUS_COLORS[job.status]
                          }`}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                        {job.components?.criticality && (
                          <span
                            className={`text-xs font-medium ${
                              CRIT_COLORS[job.components.criticality]
                            }`}
                          >
                            {job.components.criticality} criticality
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-black leading-tight">
                        {job.procedures?.title ?? "Untitled Procedure"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {job.components?.name ?? "Unknown component"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right text-xs text-zinc-400">
                      <p>{steps.length} steps</p>
                      {job.procedures?.estimated_minutes && (
                        <p>~{job.procedures.estimated_minutes}min</p>
                      )}
                      {job.completion_score != null && (
                        <p className="text-emerald-600 font-medium">
                          {job.completion_score}%
                        </p>
                      )}
                    </div>
                  </div>

                  {job.ai_feedback?.summary && (
                    <p className="mt-2 text-xs text-zinc-500 italic leading-relaxed line-clamp-2">
                      {job.ai_feedback.summary}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(job.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {job.procedures?.ai_guidance_enabled && (
                      <span className="flex items-center gap-1 text-sky-500">
                        <Zap className="w-3 h-3" /> AI enabled
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Side panel */}
      {selectedJob && (
        <div className="w-[360px] flex-shrink-0 panel p-5 sticky top-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="kicker">Procedure Steps</p>
              <h3 className="font-header text-base text-black mt-0.5 leading-tight">
                {selectedJob.procedures?.title ?? "Procedure"}
              </h3>
            </div>
            <button
              onClick={() => {
                setSelectedJob(null);
                setGuidance(null);
              }}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setActiveStep(i);
                    setGuidance(null);
                  }}
                  className={`w-full text-left rounded-xl p-3 border transition-all ${
                    isActive
                      ? "border-black/15 bg-black/[0.03]"
                      : "border-black/5 hover:bg-black/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black/[0.06] flex items-center justify-center text-[10px] font-bold text-black/60 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black leading-tight">
                        {step.title}
                      </p>
                      {isActive && (
                        <>
                          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                            {step.instruction}
                          </p>
                          {step.warning && (
                            <div className="flex items-start gap-1.5 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-amber-700 text-xs leading-relaxed">
                                {step.warning}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI Guidance */}
          {selectedJob.procedures?.ai_guidance_enabled && (
            <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
              {guidance && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-widest text-sky-400 mb-1.5 font-ui">
                    AI Guidance
                  </p>
                  <p className="text-sky-800 text-xs leading-relaxed">{guidance}</p>
                </div>
              )}
              <button
                onClick={() => fetchGuidance(selectedJob, activeStep)}
                disabled={guidanceLoading}
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-xs font-medium transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                {guidanceLoading ? "Thinking…" : "Get AI Guidance for Step"}
              </button>
            </div>
          )}

          {/* Completion score */}
          {selectedJob.completion_score != null && (
            <div className="mt-3 flex items-center gap-2 text-emerald-600 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              Completed with {selectedJob.completion_score}% score
            </div>
          )}
        </div>
      )}
    </div>
  );
}
