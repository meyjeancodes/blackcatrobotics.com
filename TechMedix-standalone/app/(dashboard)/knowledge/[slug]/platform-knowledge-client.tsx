"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Crosshair,
  Gauge,
  Layers,
  Play,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";
import type { KnowledgePlatform, FailureMode, RepairProtocol } from "@/lib/blackcat/knowledge/db";
import type { PlatformKnowledge } from "@/lib/knowledge-content";
import { getUrdfForPlatform } from "@/lib/platforms/urdf-config";
import { resolveArchetype, ARCHETYPE_META } from "@/lib/platforms/archetypes";
import { formatSpecs, type FormattedSpec } from "@/lib/platforms/spec-format";
import { UrdfRobotViewer } from "@/components/urdf-robot-viewer";

interface Props {
  platform: KnowledgePlatform | null;
  knowledge: PlatformKnowledge | null;
  failureModes: (FailureMode & { repair_protocols: RepairProtocol[] })[];
  displayName: string;
  slug: string;
}

const severityColors: Record<string, string> = {
  critical: "border-red-600 bg-red-500/10 text-red-700",
  high: "border-orange-600 bg-orange-500/10 text-orange-700",
  medium: "border-amber-600 bg-amber-500/10 text-amber-700",
  low: "border-emerald-600 bg-emerald-500/10 text-emerald-700",
};

const confidenceChip: Record<string, string> = {
  "verified-official": "bg-emerald-500/15 text-emerald-500",
  "verified-community": "bg-orange-500/15 text-orange-400",
  reported: "bg-amber-500/15 text-amber-400",
};

const confidenceLabel: Record<string, string> = {
  "verified-official": "Official",
  "verified-community": "Community-verified",
  reported: "Reported",
};

export function PlatformKnowledgeClient({
  platform,
  knowledge,
  failureModes,
  displayName,
  slug,
}: Props) {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedFailureId, setSelectedFailureId] = useState<string | null>(null);

  const archetype = useMemo(
    () => (platform ? resolveArchetype({ slug: platform.id, name: platform.name }) : "humanoid"),
    [platform]
  );
  const meta = ARCHETYPE_META[archetype];
  const urdf = getUrdfForPlatform(slug);
  const accent = meta?.accent ?? "#8b5cf6";

  const specs: FormattedSpec[] = useMemo(() => {
    if (!platform) return [];
    const entries = Object.entries(platform.specs_json).map(([label, value]) => ({
      label,
      value: String(value ?? ""),
    }));
    return formatSpecs(entries);
  }, [platform]);

  const critical = failureModes.filter((f) => f.severity === "critical").length;
  const warning = failureModes.filter((f) => f.severity === "high").length;

  const selectedFailure = failureModes.find((f) => f.id === selectedFailureId) ?? null;
  const selectedProtocol = selectedFailure?.repair_protocols?.[0] ?? null;

  const handlePartClick = useCallback((partName: string) => {
    setSelectedPart((prev) => (prev === partName ? null : partName));
  }, []);

  const specs_json = (platform?.specs_json as Record<string, unknown>) ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1">
          <p className="text-theme-35 text-xs uppercase tracking-widest mb-1">
            Repair Intelligence{platform?.type ? ` · ${platform.type.replace(/_/g, " ")}` : ""}
          </p>
          <h1 className="text-2xl font-bold text-theme-primary">{displayName}</h1>
          {platform?.manufacturer && (
            <p className="text-theme-50 text-sm">{platform.manufacturer}</p>
          )}
        </div>
        <div className="text-right text-xs text-theme-35">
          <p>{failureModes.length} known failure modes</p>
          {platform?.introduced_year && <p>Since {platform.introduced_year}</p>}
        </div>
      </div>

      {/* Main 3D + Info Layout */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* 3D Model */}
        <div className="space-y-4">
          <div className="rounded-[22px] border border-theme-5 bg-theme-2 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crosshair size={14} style={{ color: accent }} />
                <span className="text-xs uppercase tracking-widest text-theme-35">
                  Interactive 3D Model
                </span>
              </div>
              <span className="font-mono text-[0.50rem] uppercase tracking-[0.18em] text-theme-35">
                Click a part to inspect
              </span>
            </div>
            {urdf ? (
              <UrdfRobotViewer
                urdfPath={urdf.urdfPath}
                label={urdf.badge}
                height="h-[420px]"
                selectedPartId={selectedPart}
                onPartClick={handlePartClick}
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center rounded-xl border border-theme-5 bg-theme-2">
                <p className="text-theme-35 text-sm">3D model not available for this platform</p>
              </div>
            )}
            {selectedPart && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-theme-5 bg-theme-2 px-4 py-3">
                <div className="h-3 w-3 rounded-full" style={{ background: accent }} />
                <span className="text-sm font-semibold text-theme-primary">{selectedPart}</span>
                <span className="ml-auto text-xs text-theme-35">Highlighted in model</span>
              </div>
            )}
          </div>

          {/* Specs */}
          {Object.keys(specs_json).length > 0 && (
            <div className="rounded-[22px] border border-theme-5 bg-theme-2 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gauge size={14} style={{ color: accent }} />
                <span className="text-xs uppercase tracking-widest text-theme-35">
                  Platform Specs
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(specs_json).map(([k, v]) => (
                  <div key={k} className="bg-theme-2 rounded-xl border border-theme-5 px-3 py-2">
                    <p className="text-theme-35 text-xs capitalize mb-0.5">
                      {k.replace(/_/g, " ")}
                    </p>
                    <p className="text-theme-primary font-mono text-sm">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Field Knowledge (markdown layer) */}
          {knowledge && (
            <div className="rounded-[22px] border border-theme-5 bg-theme-2 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} style={{ color: accent }} />
                <span className="text-xs uppercase tracking-widest text-theme-35">
                  Field Knowledge
                </span>
              </div>
              {knowledge.overview && (
                <p className="text-theme-55 text-sm leading-relaxed mb-4">
                  {knowledge.overview}
                </p>
              )}
              {knowledge.failureModes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-theme-35">
                    Documented Failure Modes
                  </h3>
                  {knowledge.failureModes.map((f) => (
                    <div key={f.mode} className="rounded-[22px] border border-theme-5 bg-theme-2 p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-theme-primary">{f.mode}</span>
                        {confidenceLabel[f.confidence] && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              confidenceChip[f.confidence] ?? "bg-theme-5 text-theme-40"
                            }`}
                          >
                            {confidenceLabel[f.confidence]}
                          </span>
                        )}
                      </div>
                      {f.symptom && (
                        <p className="mt-2 text-xs text-theme-55"><strong className="text-theme-50">Symptom:</strong> {f.symptom}</p>
                      )}
                      {f.cause && (
                        <p className="mt-1 text-xs text-theme-55"><strong className="text-theme-50">Cause:</strong> {f.cause}</p>
                      )}
                      {f.mitigation && (
                        <p className="mt-1 text-xs text-theme-55"><strong className="text-theme-50">Mitigation:</strong> {f.mitigation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {knowledge.sources.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs uppercase tracking-widest text-theme-35 mb-2">Sources</h3>
                  <ul className="list-disc pl-5 text-xs text-theme-40 space-y-1">
                    {knowledge.sources.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Failure Mode Catalog */}
          <div className="rounded-[22px] border border-theme-5 bg-theme-2 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-xs uppercase tracking-widest text-theme-35">
                  Failure Modes
                </span>
              </div>
              <div className="flex items-center gap-1">
                {critical > 0 && (
                  <span className="rounded-full bg-red-500/[0.12] px-1.5 py-[1px] font-mono text-[0.5rem] font-semibold text-red-600">
                    {critical} crit
                  </span>
                )}
                {warning > 0 && (
                  <span className="rounded-full bg-amber-500/[0.12] px-1.5 py-[1px] font-mono text-[0.5rem] font-semibold text-amber-700">
                    {warning} warn
                  </span>
                )}
              </div>
            </div>
            {failureModes.length === 0 ? (
              <p className="text-theme-35 text-sm py-4 text-center">
                No failure modes documented yet.
              </p>
            ) : (
              <div className="space-y-2">
                {failureModes.map((fm) => (
                  <button
                    key={fm.id}
                    onClick={() => setSelectedFailureId(selectedFailureId === fm.id ? null : fm.id)}
                    className={`w-full text-left rounded-[22px] border p-4 transition ${
                      selectedFailureId === fm.id
                        ? "border-ember/50 bg-ember/[0.05]"
                        : "border-theme-5 bg-theme-2 hover:border-theme-10"
                    } ${severityColors[fm.severity]?.split(" ")[0] ?? "border-theme-5"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              severityColors[fm.severity]?.split(" ").slice(1).join(" ") ?? "bg-theme-5 text-theme-40"
                            }`}
                          >
                            {fm.severity}
                          </span>
                          <span className="text-xs text-theme-40 uppercase tracking-wider">
                            {fm.component}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-theme-primary">
                          {fm.symptom}
                        </h3>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`text-theme-35 transition ${
                          selectedFailureId === fm.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Repair Protocol Preview */}
          {selectedProtocol && selectedFailure && (
            <div className="rounded-[22px] border border-theme-5 bg-theme-2 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={14} className="text-ember" />
                <span className="text-xs uppercase tracking-widest text-theme-35">
                  Repair Protocol
                </span>
              </div>
              <h3 className="text-base font-semibold text-theme-primary">
                {selectedProtocol.title}
              </h3>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-theme-40">
                <span>
                  <span className="text-theme-35">Skill: </span>
                  <span className="text-theme-primary">{selectedProtocol.skill_level}</span>
                </span>
                {selectedProtocol.labor_minutes && (
                  <span>
                    <span className="text-theme-35">Est. time: </span>
                    <span className="text-theme-primary">
                      {selectedProtocol.labor_minutes >= 60
                        ? `${Math.floor(selectedProtocol.labor_minutes / 60)}h ${selectedProtocol.labor_minutes % 60}m`
                        : `${selectedProtocol.labor_minutes}m`}
                    </span>
                  </span>
                )}
              </div>
              {selectedProtocol.steps_json.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedProtocol.steps_json.slice(0, 3).map((s) => (
                    <div key={s.step} className="flex gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full border border-theme-5 flex items-center justify-center text-xs text-theme-40">
                        {s.step}
                      </div>
                      <p className="text-xs text-theme-55 leading-snug">{s.action}</p>
                    </div>
                  ))}
                  {selectedProtocol.steps_json.length > 3 && (
                    <p className="text-xs text-theme-35 pl-9">
                      +{selectedProtocol.steps_json.length - 3} more steps
                    </p>
                  )}
                </div>
              )}
              {selectedProtocol.parts_json.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs uppercase tracking-widest text-theme-35 mb-2">Parts Required</h4>
                  <div className="space-y-2">
                    {selectedProtocol.parts_json.map((part, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-theme-55">{part.part_name}</span>
                        <span className="text-theme-primary">
                          {part.unit_cost_usd ? `$${part.unit_cost_usd.toFixed(2)}` : ""}
                          {part.qty > 1 ? ` ×${part.qty}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
