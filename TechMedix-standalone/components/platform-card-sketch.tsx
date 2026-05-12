/**
 * PlatformCardSketch — p5.js instance-mode animated wireframe for TechMedix platform cards.
 *
 * Renders the SVG chassis silhouette/path as a living wireframe:
 *  - Parts drawn as category-colored strokes with subtle glow
 *  - Data particles travel along the paths
 *  - Hover intensifies brightness and particle count
 *  - Idle state is 25-35% opacity, hover pushes to 80-100%
 */

import p5 from "p5";
import { useMemo, useRef, useEffect } from "react";
import { getChassisForPlatform, type Part, type PartCategory } from "../lib/platforms/parts-catalog";

// ─── Category colors (match the dashboard theme) ────────────────────────────

const CATEGORY_COLOR_HEX: Record<PartCategory, string> = {
  actuator: "#FF6B35",
  sensor: "#38BDF8",
  compute: "#A78BFA",
  battery: "#34D399",
  frame: "#94A3B8",
  drivetrain: "#F59E0B",
  cooling: "#22D3EE",
  comms: "#60A5FA",
  "end-effector": "#F472B6",
  safety: "#EF4444",
};

// ─── Parse SVG path into sampling points ─────────────────────────────────────

interface SamplePoint {
  x: number;
  y: number;
  category: PartCategory;
}

function parsePathSamples(d: string, category: PartCategory, samples: number): SamplePoint[] {
  // Quick polygonal approximation: sample evenly along the d string
  const coords: number[] = [];
  const matches = d.match(/-?\d+/g);
  if (!matches) return [];
  for (const m of matches) coords.push(parseFloat(m));

  const points: SamplePoint[] = [];
  for (let i = 0; i < coords.length && i + 1 < coords.length; i += 2) {
    points.push({ x: coords[i], y: coords[i + 1], category });
  }

  // If need more samples, interpolate between existing points
  while (points.length < samples && points.length > 1) {
    const idx = Math.floor(Math.random() * (points.length - 1));
    const a = points[idx], b = points[idx + 1];
    const t = Math.random();
    points.splice(idx + 1, 0, {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      category,
    });
  }
  return points.slice(0, samples);
}

// ─── Particle system ─────────────────────────────────────────────────────────

interface Particle {
  pathIdx: number;
  pointIdx: number;
  t: number; // 0..1 interpolation between current and next point
  speed: number;
  cat: PartCategory;
  size: number;
}

function initParticle(
  pathIdx: number,
  pts: SamplePoint[],
  maxParticleSpeed: number
): Particle {
  return {
    pathIdx,
    pointIdx: Math.floor(Math.random() * (pts.length - 1)),
    t: 0,
    speed: 0.003 + Math.random() * maxParticleSpeed,
    cat: pts[0].category,
    size: 1 + Math.random() * 1.5,
  };
}

// ─── Sketch factory ──────────────────────────────────────────────────────────

function createSketch(
  canvasEl: HTMLDivElement,
  parts: Part[],
  silhouette: string,
  accents: { d?: string }[] | undefined,
  onHoverRef: { current: boolean },
  viewBoxW: number,
  viewBoxH: number,
  canvasW: number,
  canvasH: number
): p5 {
  const scale = Math.min(canvasW / viewBoxW, canvasH / viewBoxH) * 0.85;
  const offsetX = (canvasW - viewBoxW * scale) / 2;
  const offsetY = (canvasH - viewBoxH * scale) / 2;

  function tx(x: number) {
    return x * scale + offsetX;
  }
  function ty(y: number) {
    return y * scale + offsetY;
  }

  const p = new p5((sketch) => {
    // Path point data for particle system
    const pathPointSets: SamplePoint[][] = [];

    sketch.setup = () => {
      const cnv = sketch.createCanvas(canvasW, canvasH);
      cnv.parent(canvasEl);
      sketch.noFill();
      sketch.frameRate(30);

      // Parse each part's SVG path into sampled points
      for (const part of parts) {
        const pts = parsePathSamples(part.d, part.category, 30);
        if (pts.length > 1) {
          pathPointSets.push(
            pts.map((pt) => ({ x: tx(pt.x), y: ty(pt.y), category: pt.category }))
          );
        }
      }

      // Init particles
      const maxSpeed = 0.008;
      for (let i = 0; i < pathPointSets.length; i++) {
        const pts = pathPointSets[i];
        const count = Math.floor(pts.length / 4);
        for (let j = 0; j < Math.max(1, count); j++) {
          state.particles.push(initParticle(i, pts, 0.008));
        }
      }
    };

    const state = {
      particles: [] as Particle[],
    };

    sketch.draw = () => {
      sketch.clear();
      const hovered = onHoverRef.current;
      const baseAlpha = hovered ? sketch.map(sketch.frameCount % 120, 0, 120, 180, 255) : 90;
      // Idle gentle pulse
      const pulseAlpha = hovered
        ? 220
        : sketch.constrain(90 + sketch.sin(sketch.frameCount * 0.015) * 40, 50, 130);

      // ── Silhouette ────────────────────────────────────────────────────────
      if (silhouette) {
        const silAlpha = hovered ? 50 : 28;
        sketch.stroke(255, silAlpha);
        sketch.strokeWeight(scale * 0.4);
        sketch.noFill();
        drawSVGPath(sketch, silhouette, scale, offsetX, offsetY);
      }

      // ── Accents ───────────────────────────────────────────────────────────
      if (accents) {
        for (const acc of accents) {
          if (acc.d) {
            sketch.stroke(180, hovered ? 70 : 40);
            sketch.strokeWeight(scale * 0.5);
            sketch.noFill();
            drawSVGPath(sketch, acc.d, scale, offsetX, offsetY);
          }
        }
      }

      // ── Part paths with glow ──────────────────────────────────────────────
      const strokeBase = scale * 0.8;
      const strokeHover = scale * 1.2;

      for (const pts of pathPointSets) {
        if (pts.length < 2) continue;
        const cat = pts[0].category;
        const colorHex = CATEGORY_COLOR_HEX[cat] ?? "#ffffff";
        const c = sketch.red(sketch.color(colorHex));
        const cg = sketch.green(sketch.color(colorHex));
        const cb = sketch.blue(sketch.color(colorHex));

        // Glow pass
        sketch.stroke(c, cg, cb, hovered ? 35 : 15);
        sketch.strokeWeight(strokeHover + 2);
        sketch.noFill();
        beginShapePath(sketch, pts);

        // Main stroke
        sketch.stroke(c, cg, cb, pulseAlpha);
        sketch.strokeWeight(hovered ? strokeHover : strokeBase);
        sketch.noFill();
        beginShapePath(sketch, pts);

        // Node dots at vertices (extra visual interest)
        const dotAlpha = hovered ? 160 : 70;
        const dotR = hovered ? 2.2 : 1.2;
        sketch.noStroke();
        for (const pt of pts) {
          sketch.fill(c, cg, cb, dotAlpha);
          sketch.ellipse(pt.x, pt.y, dotR, dotR);
        }
      }

      // ── Particles ─────────────────────────────────────────────────────────
      for (const part of state.particles) {
        const pts = pathPointSets[part.pathIdx];
        if (!pts || pts.length < 2) continue;

        part.t += part.speed * (hovered ? 2.5 : 1);
        if (part.t >= 1) {
          part.pointIdx = (part.pointIdx + 1) % (pts.length - 1);
          part.t = 0;
          part.cat = pts[Math.max(0, part.pointIdx)].category;
        }

        const a = pts[part.pointIdx];
        const b = pts[Math.min(part.pointIdx + 1, pts.length - 1)];
        const px = a.x + (b.x - a.x) * part.t;
        const py = a.y + (b.y - a.y) * part.t;

        const colorHex = CATEGORY_COLOR_HEX[a.category] ?? "#ffffff";
        const c = sketch.red(sketch.color(colorHex));
        const cg = sketch.green(sketch.color(colorHex));
        const cb = sketch.blue(sketch.color(colorHex));

        // Glow
        sketch.noStroke();
        sketch.fill(c, cg, cb, hovered ? 60 : 25);
        sketch.ellipse(px, py, part.size * 4, part.size * 4);
        // Core
        sketch.fill(c, cg, cb, hovered ? 255 : 180);
        sketch.ellipse(px, py, part.size * 1.5, part.size * 1.5);
      }

      // ── Grid overlay (subtle tech feel) ───────────────────────────────────
      if (hovered) {
        sketch.stroke(255, 12);
        sketch.strokeWeight(0.5);
        sketch.noFill();
        const gridSize = scale * 20;
        for (let gx = offsetX % gridSize; gx < canvasW; gx += gridSize) {
          sketch.line(gx, 0, gx, canvasH);
        }
        for (let gy = offsetY % gridSize; gy < canvasH; gy += gridSize) {
          sketch.line(0, gy, canvasW, gy);
        }
      }
    };
  });

  return p;
}

function beginShapePath(sketch: p5, pts: SamplePoint[]) {
  sketch.beginShape();
  for (const pt of pts) {
    sketch.vertex(pt.x, pt.y);
  }
  sketch.endShape(sketch.CLOSE);
}

function drawSVGPath(
  sketch: p5,
  d: string,
  scale: number,
  offsetX: number,
  offsetY: number
) {
  const coords = d.match(/-?\d+/g);
  if (!coords || coords.length < 2) return;

  const n = coords.length;
  for (let i = 0; i < n && i + 1 < n; i += 2) {
    const x1 = parseFloat(coords[i]) * scale + offsetX;
    const y1 = parseFloat(coords[i + 1]) * scale + offsetY;
    const x2 = i + 2 < n ? parseFloat(coords[i + 2]) * scale + offsetX : x1;
    const y2 = i + 3 < n ? parseFloat(coords[i + 3]) * scale + offsetY : y1;
    sketch.line(x1, y1, x2, y2);
  }
}

// ─── React wrapper ───────────────────────────────────────────────────────────

interface Props {
  platformId: string;
  /** Called when user clicks the canvas */
  onClick?: () => void;
}

export function PlatformCardSketch({ platformId, onClick }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);
  const hoverRef = useRef(false);

  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);

  // Parse viewBox
  const [viewBoxW, viewBoxH] = useMemo(() => {
    const parts = chassis.viewBox.split(" ");
    return [parseFloat(parts[2] || "200"), parseFloat(parts[3] || "360")];
  }, [chassis]);

  useEffect(() => {
    if (!canvasRef.current || !chassis.parts.length) return;

    const container = canvasRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    // Clean up previous instance
    if (p5Ref.current) {
      p5Ref.current.remove();
      p5Ref.current = null;
    }

    try {
      p5Ref.current = createSketch(
        container,
        chassis.parts,
        chassis.silhouette,
        chassis.accents,
        hoverRef,
        viewBoxW,
        viewBoxH,
        w,
        h
      );
    } catch {
      // p5 failed to init — render fallback
    }

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, [platformId, chassis, viewBoxW, viewBoxH]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 rounded-t-[13px]"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      onTouchStart={() => { hoverRef.current = true; }}
      onTouchEnd={() => { hoverRef.current = false; }}
      onClick={onClick}
      role="img"
      aria-label={`Interactive wireframe diagram of ${chassis.label}`}
    />
  );
}
