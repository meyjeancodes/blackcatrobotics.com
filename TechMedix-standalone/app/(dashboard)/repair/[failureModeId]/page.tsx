/**
 * /repair/[failureModeId]
 * Full repair protocol page for a dispatched job.
 * Fetches failure mode + protocol from the knowledge DB and renders the viewer.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { RepairProtocolViewer } from "@/components/repair-protocol-viewer";
import { createServiceClient } from "@/lib/supabase-service";
import type { FailureMode, RepairProtocol } from "@/lib/blackcat/knowledge/db";

interface PageProps {
  params: Promise<{ failureModeId: string }>;
}

async function getFailureModeWithProtocol(failureModeId: string): Promise<{
  failureMode: FailureMode;
  protocol: RepairProtocol | null;
  platformName: string;
} | null> {
  const supabase = createServiceClient();

  const { data: fm, error: fmErr } = await supabase
    .from("failure_modes")
    .select("*, platform:platforms(name)")
    .eq("id", failureModeId)
    .single();

  if (fmErr || !fm) return null;

  const { data: protocol } = await supabase
    .from("repair_protocols")
    .select("*")
    .eq("failure_mode_id", failureModeId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const platformName =
    (fm.platform as { name: string } | null)?.name ?? "Unknown Platform";

  // Remove the nested platform join from the failure mode object before returning
  const { platform: _platform, ...failureMode } = fm;
  void _platform;

  return {
    failureMode: failureMode as FailureMode,
    protocol: protocol as RepairProtocol | null,
    platformName,
  };
}

async function markWorkOrderComplete(failureModeId: string): Promise<void> {
  // This would update the work order in the dispatch system.
  // Implemented as a server action below.
  void failureModeId;
}

void markWorkOrderComplete;

export default async function RepairProtocolPage({ params }: PageProps) {
  const { failureModeId } = await params;
  const result = await getFailureModeWithProtocol(failureModeId);

  if (!result) notFound();

  const { failureMode, protocol, platformName } = result;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-theme-40 font-ui uppercase tracking-[0.14em]">
        <Link href="/dispatch" className="hover:text-theme-primary/70 transition-colors">
          Dispatch
        </Link>
        <span>/</span>
        <span>{platformName}</span>
        <span>/</span>
        <span className="text-theme-60">Repair Protocol</span>
      </nav>

      {/* Platform label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-theme-40 font-ui uppercase tracking-[0.14em] mb-1">
            {platformName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {protocol?.title ?? `${failureMode.component} — ${failureMode.symptom}`}
          </h1>
        </div>
        <MarkCompleteButton failureModeId={failureModeId} />
      </div>

      {/* Repair Protocol Viewer */}
      <RepairProtocolViewer
        failureMode={failureMode}
        protocol={protocol}
      />

      {/* Source citations */}
      {failureMode.source_urls && failureMode.source_urls.length > 0 && (
        <div className="rounded-2xl border border-theme-6 bg-theme-18 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-40 mb-3">
            Research Sources
          </h2>
          <ol className="space-y-2">
            {failureMode.source_urls.map((url, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 text-theme-30 font-mono text-xs mt-0.5">
                  [{i + 1}]
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ol>
          {failureMode.confidence === "low" || failureMode.confidence === "unverified" ? (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Low-confidence entry — fewer than 3 independent sources corroborate this failure mode. Verify before proceeding.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── Mark Complete Button (client component) ───────────────────────────────────

function MarkCompleteButton({ failureModeId }: { failureModeId: string }) {
  return (
    <form action={`/api/dispatch/complete`} method="POST">
      <input type="hidden" name="failureModeId" value={failureModeId} />
      <button
        type="submit"
        className="rounded-xl bg-[#0c0d11] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 active:scale-95"
      >
        Mark Complete
      </button>
    </form>
  );
}
