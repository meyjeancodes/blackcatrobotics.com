"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle, X } from "lucide-react";

interface ParsedPreview {
  duration_min: number;
  distance_km: number;
  battery_used_pct: number;
  incidents_found: number;
  max_altitude_m: number;
  max_speed_ms: number;
}

interface FlightLogUploaderProps {
  droneId: string;
  onSuccess?: () => void;
}

export function FlightLogUploader({ droneId, onSuccess }: FlightLogUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rawContent, setRawContent] = useState<string>("");
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setPreview(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawContent(content);
      // Quick client-side parse for preview
      try {
        setPreview(quickParse(content));
      } catch {
        // Non-fatal — server will do the real parse
      }
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!rawContent) return;

    setUploading(true);
    setError(null);

    try {
      const res = await fetch(`/api/drones/${droneId}/flight-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_log: rawContent, source: "dji_assistant" }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Upload failed");
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setRawContent("");
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!file && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative rounded-[24px] border-2 border-dashed p-10 flex flex-col items-center gap-3 cursor-pointer
            transition-all duration-200
            ${isDragging
              ? "border-[#e8601e]/50 bg-[#e8601e]/[0.04]"
              : "border-theme-10 bg-theme-2 hover:border-theme-10 hover:bg-theme-4"
            }
          `}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-4">
            <Upload size={22} className="text-theme-35" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-theme-70">
              Drop your DJI flight log here
            </p>
            <p className="mt-1 text-xs text-theme-40">
              Supports DJI Assistant 2 CSV or DJI Fly JSON export
            </p>
          </div>
          <span className="font-ui text-[0.60rem] uppercase tracking-[0.18em] text-theme-30">
            Or click to browse
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json,.txt"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* File selected — preview */}
      {file && !success && (
        <div className="rounded-[20px] border border-theme-7 bg-theme-2 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8601e]/10">
                <FileText size={16} className="text-[#e8601e]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-theme-80">{file.name}</p>
                <p className="text-xs text-theme-40">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button onClick={reset} className="text-theme-30 hover:text-theme-primary/60 transition-colors">
              <X size={16} />
            </button>
          </div>

          {preview && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Duration", value: `${preview.duration_min} min` },
                { label: "Distance", value: `${preview.distance_km.toFixed(2)} km` },
                { label: "Batt Used", value: `${preview.battery_used_pct}%` },
                { label: "Max Alt", value: `${preview.max_altitude_m.toFixed(0)} m` },
                { label: "Max Speed", value: `${preview.max_speed_ms.toFixed(1)} m/s` },
                {
                  label: "Incidents",
                  value: `${preview.incidents_found}`,
                  highlight: preview.incidents_found > 0,
                },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="rounded-[14px] bg-white/60 border border-theme-4 p-2.5">
                  <p className="font-ui text-[0.56rem] uppercase tracking-[0.12em] text-theme-35 mb-0.5">{label}</p>
                  <p className={`text-sm font-semibold ${highlight ? "text-[#e8601e]" : "text-theme-70"}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {preview?.incidents_found ? (
            <div className="mb-3 flex items-center gap-2 rounded-[14px] bg-amber-500/[0.08] border border-amber-500/15 px-3.5 py-2.5 text-xs text-amber-700">
              <AlertTriangle size={13} />
              {preview.incidents_found} incident{preview.incidents_found !== 1 ? "s" : ""} found in log — will be flagged in diagnostic.
            </div>
          ) : null}

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-[14px] bg-[#e8601e]/[0.07] border border-[#e8601e]/15 px-3.5 py-2.5 text-xs text-[#e8601e]">
              <AlertTriangle size={13} />
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full rounded-full bg-[#e8601e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d4521a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Confirm Upload"}
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-3 rounded-[20px] bg-[#1db87a]/[0.08] border border-[#1db87a]/20 p-5">
          <CheckCircle size={20} className="text-[#1db87a] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#1db87a]">Flight log uploaded</p>
            <p className="text-xs text-[#1db87a]/70 mt-0.5">Log saved. Run a diagnostic to analyze updated flight history.</p>
          </div>
          <button onClick={reset} className="ml-auto text-[#1db87a]/50 hover:text-[#1db87a]">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Quick client-side parse for preview ─────────────────────────────────────
// This is approximate — the server does the canonical parse.

function quickParse(raw: string): ParsedPreview {
  if (raw.trimStart().startsWith("{") || raw.trimStart().startsWith("[")) {
    const d = JSON.parse(raw);
    const entry = Array.isArray(d) ? d[0] : d;
    return {
      duration_min: Number(entry.duration_minutes ?? entry.duration ?? 0),
      distance_km: Number(entry.distance_km ?? entry.distance ?? 0),
      battery_used_pct: Number(entry.battery_start_pct ?? 100) - Number(entry.battery_end_pct ?? 0),
      incidents_found: (entry.incidents ?? []).length,
      max_altitude_m: Number(entry.max_altitude_m ?? 0),
      max_speed_ms: Number(entry.max_speed_ms ?? 0),
    };
  }

  // CSV preview
  const lines = raw.split("\n").filter((l) => l.trim());
  return {
    duration_min: Math.max(0, lines.length - 2),
    distance_km: 0,
    battery_used_pct: 0,
    incidents_found: 0,
    max_altitude_m: 0,
    max_speed_ms: 0,
  };
}
