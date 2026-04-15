"use client";

import { useState, useEffect } from "react";
import { StatusPill } from "../../../components/status-pill";
import { RepairProtocolViewer } from "../../../components/repair-protocol-viewer";
import { Zap, CheckCircle2, BookOpen, X, UserCheck, Loader2 } from "lucide-react";
import type { FailureMode, RepairProtocol } from "../../../lib/blackcat/knowledge/db";
import type { RentAHumanResult } from "../../../lib/blackcat/dispatch/rentahuman-client";

interface Job {
  id: string;
  robotId: string;
  technicianId?: string;
  description: string;
  status: string;
  region: string;
  etaMinutes?: number | null;
  faultCode?: string;
  platformId?: string;
  lat?: number;
  lng?: number;
  severity?: number;
  createdAt?: string;
}

interface DispatchJobCardProps {
  job: Job;
  robotName: string;
  techName: string;
}

type ProtocolState = { failureMode: FailureMode; protocol: RepairProtocol | null } | null;

type VerifierModal =
  | { phase: "searching" }
  | { phase: "results"; humans: RentAHumanResult[] }
  | { phase: "confirming"; human: RentAHumanResult }
  | { phase: "booking" }
  | { phase: "booked"; bookingId: string }
  | { phase: "error"; message: string };

/** Returns elapsed minutes since an ISO timestamp (or null if unparseable). */
function elapsedMinutes(isoString?: string): number | null {
  if (!isoString) return null;
  const ms = Date.now() - new Date(isoString).getTime();
  return ms / 60_000;
}

/** Build plain-language field verifier instructions from available job context. */
function buildVerifierInstructions(
  job: Job,
  robotName: string,
  protocol: ProtocolState
): string {
  const lines: string[] = [
    `You are a field verifier dispatched to inspect a malfunctioning robot.`,
    ``,
    `Robot: ${robotName}`,
    `Job description: ${job.description}`,
    `Region: ${job.region}`,
    ...(job.faultCode ? [`Fault code: ${job.faultCode}`] : []),
  ];

  if (protocol?.failureMode) {
    lines.push(``, `Known failure mode: ${protocol.failureMode.component} — ${protocol.failureMode.symptom}`);
    lines.push(`Root cause: ${protocol.failureMode.root_cause}`);
  }

  if (protocol?.protocol) {
    const p = protocol.protocol as Record<string, unknown>;
    if (Array.isArray(p.steps) && p.steps.length > 0) {
      lines.push(``, `Verification steps:`);
      (p.steps as string[]).forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    }
  }

  lines.push(
    ``,
    `Take clear photos of: (1) overall robot, (2) fault area, (3) any visible damage or error codes.`,
    `Upload all photos through the RentAHuman app when the job is complete.`,
    `Do NOT attempt repairs — this is a visual verification and documentation task only.`
  );

  return lines.join("\n");
}

export function DispatchJobCard({ job, robotName, techName }: DispatchJobCardProps) {
  const [briefing, setBriefing] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<ProtocolState>(null);
  const [protocolLoading, setProtocolLoading] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  // Field verifier fallback state
  const [showVerifierButton, setShowVerifierButton] = useState(false);
  const [verifierModal, setVerifierModal] = useState<VerifierModal | null>(null);

  // After 30 min with no tech assigned, reveal the field verifier button
  useEffect(() => {
    if (job.technicianId) return; // already assigned — skip

    const elapsed = elapsedMinutes(job.createdAt);
    if (elapsed !== null && elapsed >= 30) {
      setShowVerifierButton(true);
      return;
    }

    // Schedule reveal for the remaining time
    const remaining = elapsed !== null ? (30 - elapsed) * 60_000 : 30 * 60_000;
    const timer = setTimeout(() => setShowVerifierButton(true), remaining);
    return () => clearTimeout(timer);
  }, [job.technicianId, job.createdAt]);

  async function loadProtocol() {
    if (!job.platformId) return;
    setProtocolLoading(true);
    setShowProtocol(true);
    try {
      const res = await fetch(
        `/api/techmedix/platforms/${job.platformId}/failure-modes?severity=critical`
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const failureModes: FailureMode[] = data.failure_modes ?? [];
      const fm = failureModes[0];
      if (!fm) { setProtocolLoading(false); return; }

      const protoRes = await fetch(`/api/techmedix/failure-modes/${fm.id}/protocol`);
      const protoData = await protoRes.json();
      setProtocol({ failureMode: fm, protocol: protoData.protocol ?? null });
    } catch (err) {
      console.error("[DispatchJobCard] protocol load error:", err);
    } finally {
      setProtocolLoading(false);
    }
  }

  async function briefTechnician() {
    if (!job.technicianId || briefing !== "idle") return;
    setBriefing("loading");

    try {
      const res = await fetch("/api/hermes/spawn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId: job.id,
          technicianId: job.technicianId,
          robotId: job.robotId,
          faultCode: job.faultCode ?? "GENERAL",
          platformId: job.platformId ?? "unknown",
        }),
      });

      if (!res.ok) throw new Error(`Spawn API ${res.status}`);

      const data: { agentSessionId: string; contextInjected: boolean; deliveryMethod: string } =
        await res.json();

      setSessionId(data.agentSessionId);
      setBriefing("done");
    } catch (err) {
      console.error("[DispatchJobCard] Hermes spawn error:", err);
      setBriefing("error");
    }
  }

  // ── Field verifier flow ──────────────────────────────────────────────────────

  async function openVerifierSearch() {
    setVerifierModal({ phase: "searching" });

    // Ensure protocol is loaded for better instructions
    if (!protocol && job.platformId) {
      loadProtocol();
    }

    try {
      const params = new URLSearchParams({
        lat: String(job.lat ?? 0),
        lng: String(job.lng ?? 0),
        radius: "25",
        skills: "drone_inspection,electronics,field_verification",
      });
      const res = await fetch(`/api/dispatch/field-verifier?${params}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setVerifierModal({ phase: "results", humans: data.results ?? [] });
    } catch (err) {
      console.error("[DispatchJobCard] verifier search error:", err);
      setVerifierModal({ phase: "error", message: "Search failed — check RentAHuman API config." });
    }
  }

  async function confirmBooking(human: RentAHumanResult) {
    setVerifierModal({ phase: "booking" });

    const instructions = buildVerifierInstructions(job, robotName, protocol);

    try {
      const res = await fetch("/api/dispatch/field-verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          humanId: human.id,
          taskInstructions: instructions,
          durationHours: 2,
          budgetUsd: Math.ceil(human.hourlyRateUsd * 2),
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setVerifierModal({ phase: "booked", bookingId: data.booking.bookingId });
      setShowVerifierButton(false);
    } catch (err) {
      console.error("[DispatchJobCard] booking error:", err);
      setVerifierModal({ phase: "error", message: "Booking failed — please retry." });
    }
  }

  return (
    <div className="rounded-[22px] border border-theme-5 bg-theme-2 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-theme-45">{robotName}</p>
          <h3 className="mt-2 text-lg font-semibold text-theme-primary">{job.description}</h3>
        </div>
        <StatusPill label={job.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-5 text-sm text-theme-60">
        <span>Region: {job.region}</span>
        <span>Technician: {techName}</span>
        <span>ETA: {job.etaMinutes ? `${job.etaMinutes} min` : "Pending"}</span>
      </div>

      {/* Repair protocol inline viewer */}
      {showProtocol && (
        <div className="mt-4">
          {protocolLoading ? (
            <div className="h-24 bg-theme-5 rounded-xl animate-pulse" />
          ) : protocol ? (
            <RepairProtocolViewer
              failureMode={protocol.failureMode}
              protocol={protocol.protocol}
              onClose={() => setShowProtocol(false)}
            />
          ) : (
            <div className="flex items-center justify-between text-xs text-theme-40 bg-theme-5 rounded-xl px-4 py-3">
              <span>No repair protocol found for this platform.</span>
              <button onClick={() => setShowProtocol(false)} className="text-theme-30 hover:text-theme-primary/60"><X size={12} /></button>
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {job.platformId && !showProtocol && (
          <button
            onClick={loadProtocol}
            className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-3 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-theme-55 transition hover:bg-theme-4 hover:text-theme-primary"
          >
            <BookOpen size={11} />
            Repair Protocol
          </button>
        )}

        {/* Hermes brief — only when a real tech is assigned */}
        {job.technicianId && (
          <>
            {briefing === "idle" && (
              <button
                onClick={briefTechnician}
                className="inline-flex items-center gap-1.5 rounded-full border border-theme-10 px-3 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-theme-55 transition hover:bg-theme-4 hover:text-theme-primary"
              >
                <Zap size={11} />
                Brief AI Assistant
              </button>
            )}
            {briefing === "loading" && (
              <span className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-theme-40">
                Briefing technician...
              </span>
            )}
            {briefing === "done" && (
              <div className="flex items-center gap-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-emerald-700">
                <CheckCircle2 size={12} />
                AI assistant briefed
                {sessionId && (
                  <span className="ml-1 font-mono text-theme-35">({sessionId})</span>
                )}
              </div>
            )}
            {briefing === "error" && (
              <span className="font-ui text-[0.58rem] uppercase tracking-[0.16em] text-red-600">
                Brief failed — retry
              </span>
            )}
          </>
        )}

        {/* Field verifier fallback — appears after 30 min unassigned */}
        {showVerifierButton && !verifierModal && (
          <button
            onClick={openVerifierSearch}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-3 py-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            <UserCheck size={11} />
            Book Field Verifier
          </button>
        )}

        {/* Booked confirmation pill */}
        {verifierModal?.phase === "booked" && (
          <div className="flex items-center gap-1.5 font-ui text-[0.58rem] uppercase tracking-[0.16em] text-emerald-700">
            <CheckCircle2 size={12} />
            Field verifier booked
            <span className="ml-1 font-mono text-theme-35">({verifierModal.bookingId})</span>
          </div>
        )}
      </div>

      {/* Field verifier modal */}
      {verifierModal && verifierModal.phase !== "booked" && (
        <VerifierModal
          modal={verifierModal}
          onSelect={(human) => setVerifierModal({ phase: "confirming", human })}
          onConfirm={confirmBooking}
          onClose={() => setVerifierModal(null)}
        />
      )}
    </div>
  );
}

// ── Field Verifier Modal ───────────────────────────────────────────────────────

interface VerifierModalProps {
  modal: VerifierModal;
  onSelect: (human: RentAHumanResult) => void;
  onConfirm: (human: RentAHumanResult) => void;
  onClose: () => void;
}

function VerifierModal({ modal, onSelect, onConfirm, onClose }: VerifierModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-30 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[22px] border border-theme-8 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-theme-30 hover:text-theme-primary/60"
        >
          <X size={16} />
        </button>

        <p className="text-xs uppercase tracking-[0.22em] text-theme-40 mb-1">RentAHuman</p>
        <h2 className="text-lg font-semibold text-theme-primary mb-4">Book Field Verifier</h2>

        {modal.phase === "searching" && (
          <div className="flex items-center gap-2 text-sm text-theme-55">
            <Loader2 size={14} className="animate-spin" />
            Searching nearby verifiers...
          </div>
        )}

        {modal.phase === "results" && (
          <>
            {modal.humans.length === 0 ? (
              <p className="text-sm text-theme-50">No verifiers available nearby. Try expanding the radius.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {modal.humans.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => onSelect(h)}
                    className="w-full text-left rounded-xl border border-theme-8 bg-theme-2 p-3 transition hover:bg-theme-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-theme-primary">{h.displayName}</span>
                      <span className="font-mono text-xs text-theme-50">${h.hourlyRateUsd}/hr</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-theme-45">
                      <span>{h.distanceMiles.toFixed(1)} mi away</span>
                      <span>Rating {h.rating.toFixed(1)} ({h.reviewCount})</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {h.skills.map((s) => (
                        <span key={s} className="rounded-full bg-theme-6 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-theme-50">{s}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {modal.phase === "confirming" && (
          <div>
            <p className="text-sm text-theme-70 mb-4">
              Confirm booking <span className="font-semibold text-theme-primary">{modal.human.displayName}</span> for a 2-hour verification?
            </p>
            <div className="rounded-xl bg-theme-3 border border-theme-8 px-4 py-3 text-sm text-theme-60 space-y-1 mb-4">
              <div className="flex justify-between"><span>Rate</span><span className="font-mono">${modal.human.hourlyRateUsd}/hr</span></div>
              <div className="flex justify-between"><span>Duration</span><span>2 hours</span></div>
              <div className="flex justify-between font-semibold text-theme-primary"><span>Total</span><span className="font-mono">${(modal.human.hourlyRateUsd * 2).toFixed(2)}</span></div>
            </div>
            <p className="text-xs text-theme-40 mb-4">
              AI-generated task instructions and verification photo requirements will be sent to the verifier automatically.
            </p>
            <button
              onClick={() => onConfirm(modal.human)}
              className="w-full rounded-full bg-[#0c0d11] text-white font-semibold text-sm py-2.5 transition hover:bg-[#17181d]/80"
            >
              Confirm Booking
            </button>
          </div>
        )}

        {modal.phase === "booking" && (
          <div className="flex items-center gap-2 text-sm text-theme-55">
            <Loader2 size={14} className="animate-spin" />
            Confirming booking with RentAHuman...
          </div>
        )}

        {modal.phase === "error" && (
          <div>
            <p className="text-sm text-red-600 mb-4">{modal.message}</p>
            <button
              onClick={onClose}
              className="text-xs text-theme-40 underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
