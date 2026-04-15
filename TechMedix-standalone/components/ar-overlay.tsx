"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, Wifi, WifiOff } from "lucide-react";

interface ComponentHighlight {
  x: number;
  y: number;
  radius: number;
  label: string;
}

interface ARGuidanceResponse {
  overlay_text: string;
  component_highlight: ComponentHighlight | null;
  next_step: string;
  severity: "ok" | "warning" | "critical";
  confidence: number;
}

interface AROverlayProps {
  robotId: string;
  platformId: string;
  isActive: boolean;
  activeFault?: string;
}

const SEVERITY_COLORS = {
  ok: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
} as const;

const CAPTURE_INTERVAL_MS = 2000;

export function AROverlay({ robotId, platformId, isActive, activeFault }: AROverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<ARGuidanceResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Start camera stream
  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!cancelled) setStreamReady(true);
          };
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            setPermissionDenied(true);
          } else {
            setApiError("Camera unavailable on this device.");
          }
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setStreamReady(false);
    };
  }, [isActive]);

  // Resize canvas to match video
  useEffect(() => {
    if (!streamReady || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    function resize() {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
    }

    video.addEventListener("resize", resize);
    resize();
    return () => video.removeEventListener("resize", resize);
  }, [streamReady]);

  // Capture frame, send to API, render overlay
  const captureAndAnalyze = useCallback(async () => {
    if (!streamReady || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Export JPEG at 0.7 quality
    const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
    if (!base64) return;

    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/ar-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: base64, robotId, activeFault }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: ARGuidanceResponse = await res.json();
      setGuidance(data);

      // Render overlay on canvas
      // Re-draw video frame first
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (data.component_highlight) {
        const { x, y, radius, label } = data.component_highlight;
        const cx = x * canvas.width;
        const cy = y * canvas.height;
        const r = radius * Math.min(canvas.width, canvas.height);
        const color = SEVERITY_COLORS[data.severity];

        // Draw circle highlight
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Fill with transparent
        ctx.fillStyle = `${color}22`;
        ctx.fill();

        // Label
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = color;
        ctx.fillText(label, cx + r + 6, cy);
      }

      if (data.overlay_text) {
        const padding = 12;
        const textX = padding;
        const textY = canvas.height - padding;
        ctx.font = "bold 15px monospace";
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(data.overlay_text, textX, textY);
      }
    } catch (err) {
      console.error("[AROverlay] capture error:", err);
      setApiError("AR guidance temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [streamReady, robotId, activeFault]);

  // Start/stop capture interval
  useEffect(() => {
    if (!isActive || !streamReady) return;

    captureAndAnalyze();
    intervalRef.current = setInterval(captureAndAnalyze, CAPTURE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, streamReady, captureAndAnalyze]);

  if (!isActive) return null;

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0c0d11] text-white p-8 text-center gap-4">
        <WifiOff size={40} className="text-red-400" />
        <p className="text-lg font-semibold">Camera permission denied</p>
        <p className="text-sm text-white/60 max-w-sm">
          Allow camera access in your browser settings, then reload the page to use AR mode.
        </p>
      </div>
    );
  }

  const severityColor = guidance ? SEVERITY_COLORS[guidance.severity] : "#22c55e";

  return (
    <div className="relative w-full h-full bg-[#0c0d11] overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0c0d11]/70 text-white text-xs px-3 py-1.5 rounded-full font-mono">
          Analyzing...
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
          <WifiOff size={12} />
          {apiError}
        </div>
      )}

      {/* Info panel — right side */}
      {guidance && (
        <div className="absolute top-4 right-4 w-72 bg-[#17181d]/80 border border-white/10 rounded-2xl p-4 space-y-3">
          {/* Severity indicator */}
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: severityColor }}
            />
            <span
              className="text-xs font-mono uppercase tracking-widest font-semibold"
              style={{ color: severityColor }}
            >
              {guidance.severity}
            </span>
            {guidance.confidence > 0 && (
              <span className="ml-auto text-xs text-white/40 font-mono">
                {Math.round(guidance.confidence * 100)}% conf
              </span>
            )}
          </div>

          {/* Overlay text */}
          {guidance.overlay_text && (
            <p className="text-sm text-white font-medium leading-snug">
              {guidance.overlay_text}
            </p>
          )}

          {/* Next step */}
          {guidance.next_step && (
            <div className="border-t border-white/10 pt-3">
              <p className="text-[0.6rem] uppercase tracking-widest text-white/40 font-mono mb-1">
                Next step
              </p>
              <p className="text-xs text-white/80 leading-relaxed">
                {guidance.next_step}
              </p>
            </div>
          )}

          {/* Component highlight label */}
          {guidance.component_highlight && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: severityColor, opacity: 0.7 }}
              />
              <span>Inspecting: {guidance.component_highlight.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Stream status */}
      {streamReady ? (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white/50">
          <Wifi size={12} className="text-green-400" />
          <span>Live — {platformId}</span>
        </div>
      ) : (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white/50">
          <WifiOff size={12} />
          <span>Initializing camera...</span>
        </div>
      )}

      {/* Severity severity — critical banner */}
      {guidance?.severity === "critical" && (
        <div className="absolute top-0 inset-x-0 bg-red-600/90 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
          <AlertTriangle size={16} />
          Critical fault detected — do not operate robot
        </div>
      )}

      {/* OK confirmation */}
      {guidance?.severity === "ok" && guidance.confidence > 0.7 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-green-900/80 text-green-300 text-xs px-4 py-2 rounded-full flex items-center gap-2">
          <CheckCircle size={12} />
          System nominal
        </div>
      )}
    </div>
  );
}
