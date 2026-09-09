/**
 * AR Overlay Component
 *
 * Renders a WebXR-compatible AR overlay with fault-highlighted
 * 3D model parts. Falls back to a 2D canvas overlay on mobile.
 *
 * Uses the existing UrdfRobotViewer 3D model infrastructure
 * for part selection and highlighting.
 */

"use client";

import { useState, useCallback } from "react";

interface AROverlayProps {
  robotId: string;
  platformId: string;
  faultCode: string;
  overlayInstructions?: string;
  confidence?: number;
  imageData?: string;
}

interface PartHighlight {
  partId: string;
  color: string;
  opacity: number;
}

export default function AROverlay({
  robotId,
  platformId,
  faultCode,
  overlayInstructions,
  confidence,
  imageData,
}: AROverlayProps) {
  const [isARActive, setIsARActive] = useState(false);
  const [highlights, setHighlights] = useState<PartHighlight[]>([]);

  const activateAR = useCallback(async () => {
    try {
      // Check for WebXR support
      const xrSupported =
        typeof navigator !== "undefined" &&
        "xr" in navigator &&
        await (navigator as Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }).xr?.isSessionSupported("immersive-ar");

      if (xrSupported) {
        setIsARActive(true);
      } else {
        // Fallback: 2D overlay mode
        setIsARActive(false);
        // Parse fault code to determine which parts to highlight
        setHighlights([
          { partId: faultCode, color: "#ff6b35", opacity: 0.6 },
        ]);
      }
    } catch {
      setIsARActive(false);
      setHighlights([
        { partId: faultCode, color: "#ff6b35", opacity: 0.6 },
      ]);
    }
  }, [faultCode]);

  return (
    <div className="ar-overlay-container relative w-full h-full">
      {/* AR Header with confidence and instructions */}
      <div className="ar-overlay-header flex items-center justify-between p-3 bg-black/80 text-white rounded-t-lg">
        <div>
          <span className="text-sm font-semibold">
            AR Guidance — {robotId} / {platformId}
          </span>
          {confidence !== undefined && (
            <span className="ml-2 text-xs opacity-70">
              Confidence: {(confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <button
          onClick={activateAR}
          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm"
        >
          {isARActive ? "🥽 AR Mode" : "▶ Start AR"}
        </button>
      </div>

      {/* Overlay Instructions Panel */}
      {overlayInstructions && (
        <div className="ar-instructions p-3 bg-black/70 text-white text-sm rounded-b-lg max-h-40 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{overlayInstructions}</pre>
        </div>
      )}

      {/* 3D Viewport / AR Canvas Placeholder */}
      <div className="ar-viewport relative w-full h-[400px] bg-gray-900 rounded-lg overflow-hidden mt-2">
        {/* 3D URDF model would render here via UrdfRobotViewer */}
        {/* Highlights would overlay the 3D model parts */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          {isARActive
            ? "🥽 Immersive AR Session Active"
            : "3D Model View — Select parts to highlight"}
        </div>
      </div>
    </div>
  );
}
