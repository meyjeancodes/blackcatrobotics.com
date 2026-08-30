"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle, ChevronRight, Wrench, DollarSign, ExternalLink, Package, Clock, Shield, Zap } from "lucide-react";
import type { FailureMode } from "@/lib/blackcat/knowledge/db";

interface SymptomFinderProps {
  failureModes: (FailureMode & { platform_name: string; platform_slug: string })[];
}

const SYMPTOM_CATEGORIES = [
  { label: "Movement", icon: Zap, symptoms: ["won't walk", "not moving", "slow", "vibration"] },
  { label: "Noise", icon: AlertTriangle, symptoms: ["grinding noise", "clicking", "squealing"] },
  { label: "Heat", icon: AlertTriangle, symptoms: ["overheating", "hot", "thermal"] },
  { label: "Power", icon: Zap, symptoms: ["battery draining", "not charging", "power loss"] },
  { label: "Sensing", icon: Search, symptoms: ["camera offline", "sensor error", "perception"] },
  { label: "Manipulation", icon: Wrench, symptoms: ["arm not responding", "gripper", "hand"] },
];

const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  "won't walk": ["gait", "walking", "leg", "foot", "ankle", "knee", "hip"],
  "not moving": ["actuator", "motor", "joint", "frozen", "stuck", "unresponsive"],
  "grinding noise": ["gear", "joint", "backlash", "actuator", "transmission"],
  "overheating": ["temperature", "thermal", "heat", "cooling", "actuator"],
  "battery draining": ["battery", "power", "charge", "voltage", "SOC"],
  "camera offline": ["camera", "vision", "sensor", "depth", "lidar", "perception"],
  "arm not responding": ["arm", "hand", "gripper", "wrist", "elbow", "shoulder"],
  "error code": ["error", "fault", "diagnostic", "code", "alert"],
  "vibration": ["vibration", "oscillation", "instability", "wobble", "shake"],
  "slow": ["latency", "slow", "performance", "speed", "response"],
};

export function SymptomFinder({ failureModes }: SymptomFinderProps) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const keywords: string[] = [];

    // Match against known symptom categories
    for (const [symptom, words] of Object.entries(SYMPTOM_KEYWORDS)) {
      if (q.includes(symptom) || words.some((w) => q.includes(w))) {
        keywords.push(...words, symptom);
      }
    }
    // Also include raw query words
    keywords.push(...q.split(/\s+/));

    const scored = failureModes.map((fm) => {
      const text = `${fm.symptom} ${fm.root_cause} ${fm.component} ${fm.tags?.join(" ")}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) score += kw.length; // longer matches score higher
      }
      return { fm, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((s) => s.fm);
  }, [query, failureModes]);

  return (
    <div className="rounded-[22px] border border-theme-5 bg-theme-2 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Search size={14} className="text-ember" />
        <span className="text-xs uppercase tracking-widest text-theme-35">
          Diagnostic Symptom Finder
        </span>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Describe the symptom — e.g. 'robot won't walk', 'grinding noise', 'overheating'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-[14px] border border-theme-5 bg-theme-2 pl-4 pr-4 py-3 text-sm text-theme-primary placeholder:text-theme-35 focus:outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/20 transition"
        />
      </div>

      {/* Symptom categories */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {SYMPTOM_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.symptoms.some((s) => query.includes(s));
          return (
            <button
              key={cat.label}
              onClick={() => setQuery(cat.symptoms[0])}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition ${
                isActive
                  ? "border-ember/50 bg-ember/10 text-ember"
                  : "border-theme-5 text-theme-40 hover:border-theme-10 hover:text-theme-50"
              }`}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick symptom chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(SYMPTOM_KEYWORDS).slice(0, 6).map((symptom) => (
          <button
            key={symptom}
            onClick={() => setQuery(symptom)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              query === symptom
                ? "border-ember/50 bg-ember/10 text-ember"
                : "border-theme-5 text-theme-40 hover:border-theme-10 hover:text-theme-50"
            }`}
          >
            {symptom}
          </button>
        ))}
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="space-y-2">
          {matches.length === 0 ? (
            <p className="text-theme-35 text-sm py-4 text-center">
              No matching failure modes found. Try a different description.
            </p>
          ) : (
            <>
              <p className="text-theme-35 text-xs uppercase tracking-wider mb-2">
                {matches.length} possible failure{matches.length !== 1 ? "s" : ""} found
              </p>
              {matches.map((fm) => (
                <a
                  key={fm.id}
                  href={`/knowledge/${fm.platform_slug}`}
                  className="flex items-center gap-3 rounded-[14px] border border-theme-5 bg-theme-2 p-3 hover:border-ember/30 transition group"
                >
                  <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-primary truncate group-hover:text-ember transition">
                      {fm.symptom}
                    </p>
                    <p className="text-xs text-theme-40">
                      {fm.platform_name} · {fm.component}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      fm.severity === "critical"
                        ? "bg-red-500/10 text-red-600"
                        : fm.severity === "high"
                        ? "bg-orange-500/10 text-orange-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {fm.severity}
                  </span>
                  <ExternalLink size={12} className="text-theme-35 group-hover:text-ember transition shrink-0" />
                </a>
              ))}
            </>
          )}
        </div>
      )}

      {!query.trim() && (
        <p className="text-theme-35 text-xs text-center py-2">
          Describe a symptom to find matching failure modes and repair protocols across all platforms.
        </p>
      )}
    </div>
  );
}
