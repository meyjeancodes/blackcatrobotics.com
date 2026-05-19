"use client";

import { useEffect, useRef, useState } from "react";
import p5 from "p5";

export type PlatformCategory =
  | "humanoid"
  | "drone"
  | "industrial"
  | "delivery"
  | "micromobility"
  | "datacenter";

interface PlatformArtCanvasProps {
  category: PlatformCategory;
  accentColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

const CATEGORY_CONFIGS: Record<PlatformCategory, { colors: string[]; accent: string }> = {
  humanoid: {
    accent: "#8b5cf6",
    colors: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#6d28d9", "#4c1d95", "#1a1830"],
  },
  drone: {
    accent: "#0ea5e9",
    colors: ["#0ea5e9", "#38bdf8", "#7dd3fc", "#0284c7", "#0369a1", "#0c1929"],
  },
  industrial: {
    accent: "#f59e0b",
    colors: ["#f59e0b", "#fbbf24", "#fcd34d", "#d97706", "#b45309", "#1c1a14"],
  },
  delivery: {
    accent: "#10b981",
    colors: ["#10b981", "#34d399", "#6ee7b7", "#059669", "#047857", "#0f1c17"],
  },
  micromobility: {
    accent: "#f43f5e",
    colors: ["#f43f5e", "#fb7185", "#fda4af", "#e11d48", "#be123c", "#1c1118"],
  },
  datacenter: {
    accent: "#64748b",
    colors: ["#64748b", "#94a3b8", "#cbd5e1", "#475569", "#334155", "#141c24"],
  },
};

function humanoidSketch(p: p5, colors: string[], w: number, h: number) {
  const c = p as any;
  const [violet, light, lighter, dark, darkest, bg] = colors;

  p.setup = () => {
    const canvasW = Math.min(w, 400);
    const canvasH = (canvasW * h) / w || Math.min(h, 300);
    const canvas = p.createCanvas(canvasW, canvasH);
    canvas.parent((p as any).canvasContainer);
    c.noFill();
    c.strokeWeight(1.2);
    c.stroke(c.color(violet));

    // Background
    c.background(c.color(bg));

    // Subtle grid
    c.stroke(c.color(light, 16));
    for (let x = 0; x < p.width; x += 20) {
      c.line(x, 0, x, p.height);
    }
    for (let y = 0; y < p.height; y += 20) {
      c.line(0, y, p.width, y);
    }

    // Articulated humanoid figure
    const cx = p.width / 2;
    const cy = p.height / 2;

    // Head
    c.stroke(c.color(light));
    c.ellipse(cx, cy - 55, 18, 22);

    // Head sensor markers
    c.fill(c.color(violet, 180));
    c.noStroke();
    c.ellipse(cx - 4, cy - 58, 3, 3);
    c.ellipse(cx + 4, cy - 58, 3, 3);
    c.stroke(c.color(violet));

    // Torso
    c.line(cx, cy - 42, cx, cy + 5);

    // Shoulders
    c.line(cx - 20, cy - 35, cx + 20, cy - 35);

    // Left arm
    c.line(cx - 20, cy - 35, cx - 28, cy - 10);
    c.line(cx - 28, cy - 10, cx - 22, cy + 15);

    // Right arm
    c.line(cx + 20, cy - 35, cx + 28, cy - 10);
    c.line(cx + 28, cy - 10, cx + 22, cy + 15);

    // Legs
    c.line(cx, cy + 5, cx - 12, cy + 35);
    c.line(cx, cy + 5, cx + 12, cy + 35);
    c.line(cx - 12, cy + 35, cx - 14, cy + 55);
    c.line(cx + 12, cy + 35, cx + 14, cy + 55);

    // Joint nodes (DOF markers)
    c.noStroke();
    const joints = [
      [cx, cy - 42], [cx - 20, cy - 35], [cx + 20, cy - 35],
      [cx - 28, cy - 10], [cx + 28, cy - 10],
      [cx - 22, cy + 15], [cx + 22, cy + 15],
      [cx, cy + 5],
      [cx - 12, cy + 35], [cx + 12, cy + 35],
      [cx - 14, cy + 55], [cx + 14, cy + 55],
    ];
    joints.forEach(([jx, jy]) => {
      c.fill(c.color(darkest));
      c.ellipse(jx, jy, 6, 6);
      c.stroke(c.color(light));
      c.noFill();
      c.ellipse(jx, jy, 8, 8);
    });

    // Sensor sweep lines
    c.stroke(c.color(violet, 40));
    c.noFill();
    for (let i = 0; i < 8; i++) {
      const angle = (p.TWO_PI / 8) * i;
      const r = p.random(30, 60);
      c.line(cx + p.cos(angle) * 10, cy - 20 + p.sin(angle) * 10,
             cx + p.cos(angle) * r, cy - 20 + p.sin(angle) * r);
    }

    // Technical label
    c.noStroke();
    c.fill(c.color(light, 306));
    c.textSize(9);
    c.textFont("monospace");
    c.textAlign(c.RIGHT, c.BOTTOM);
    c.text(`${p.floor(p.random(35, 50))} DOF`, p.width - 8, p.height - 6);
  };
}

function droneSketch(p: p5, colors: string[], w: number, h: number) {
  const c = p as any;
  const [blue, light, lighter, dark, darkest, bg] = colors;

  c.setup = () => {
    const canvasW = Math.min(w, 400);
    const canvasH = (canvasW * h) / w || Math.min(h, 300);
    const canvas = p.createCanvas(canvasW, canvasH);
    canvas.parent((p as any).canvasContainer);

    // Background
    c.background(c.color(bg));

    // Radar sweep circles
    const cx = p.width / 2;
    const cy = p.height / 2;
    c.noFill();

    for (let r = 20; r < 120; r += 20) {
      c.stroke(c.color(blue, 25));
      c.ellipse(cx, cy, r * 2, r * 2);
    }

    // Cross lines
    c.stroke(c.color(blue, 15));
    c.line(cx, 0, cx, p.height);
    c.line(0, cy, p.width, cy);

    // Aircraft top-down silhouette
    c.stroke(c.color(light));
    c.strokeWeight(1.5);

    // Body
    c.ellipse(cx, cy, 16, 40);

    // Arms
    c.line(cx - 30, cy - 20, cx + 30, cy - 20);
    c.line(cx - 30, cy + 20, cx + 30, cy + 20);

    // Propellers (4)
    c.noFill();
    c.stroke(c.color(blue, 120));
    c.strokeWeight(1);
    [[cx - 30, cy - 20], [cx + 30, cy - 20], [cx - 30, cy + 20], [cx + 30, cy + 20]].forEach(([px, py]) => {
      c.ellipse(px, py, 22, 22);
      c.stroke(c.color(blue, 60));
      for (let i = 0; i < 3; i++) {
        const angle = (p.PI * 2 / 3) * i;
        c.line(px, py, px + p.cos(angle) * 10, py + p.sin(angle) * 10);
      }
      c.stroke(c.color(blue, 120));
    });

    // Camera/sensor indicator
    c.noStroke();
    c.fill(c.color(blue, 180));
    c.ellipse(cx, cy + 25, 6, 6);

    // Altitude data points
    c.stroke(c.color(dark));
    c.strokeWeight(1);
    for (let i = 0; i < 5; i++) {
      const dx = 10 + i * 18;
      const dy = cy + 60;
      const barH = p.random(5, 25);
      c.line(dx, dy, dx, dy - barH);
      c.fill(c.color(light, 204));
      c.noStroke();
      c.rect(dx - 3, dy, 6, 2);
      c.stroke(c.color(dark));
    }

    // Label
    c.noStroke();
    c.fill(c.color(light, 306));
    c.textSize(9);
    c.textFont("monospace");
    c.textAlign(c.RIGHT, c.BOTTOM);
    c.text("4-ROTOR · IP54", p.width - 8, p.height - 6);
  };
}

function industrialSketch(p: p5, colors: string[], w: number, h: number) {
  const c = p as any;
  const [amber, light, lighter, dark, darkest, bg] = colors;

  c.setup = () => {
    const canvasW = Math.min(w, 400);
    const canvasH = (canvasW * h) / w || Math.min(h, 300);
    const canvas = p.createCanvas(canvasW, canvasH);
    canvas.parent((p as any).canvasContainer);

    c.background(c.color(bg));

    // Hex grid pattern
    const hexSize = 18;
    const hexW = hexSize * 2;
    const hexH = Math.sqrt(3) * hexSize;

    c.noFill();
    c.stroke(c.color(amber, 20));
    c.strokeWeight(0.8);

    for (let row = -1; row < p.height / hexH + 1; row++) {
      for (let col = -1; col < p.width / hexW + 1; col++) {
        const x = col * hexW * 1.5;
        const y = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
        c.beginShape();
        for (let i = 0; i < 6; i++) {
          const angle = p.PI / 3 * i - p.PI / 6;
          c.vertex(x + hexSize * p.cos(angle), y + hexSize * p.sin(angle));
        }
        c.endShape(c.CLOSE);
      }
    }

    // Actuator node visualization - central robot node
    const cx = p.width / 2;
    const cy = p.height / 2;
    c.noFill();

    // Central body
    c.stroke(c.color(light));
    c.strokeWeight(2);
    c.rectMode(c.CENTER);
    c.rect(cx, cy, 30, 40, 4);

    // Legs (quadruped)
    c.strokeWeight(1.5);
    c.stroke(c.color(amber));
    c.line(cx - 15, cy + 15, cx - 35, cy + 30);
    c.line(cx + 15, cy + 15, cx + 35, cy + 30);
    c.line(cx - 15, cy - 15, cx - 35, cy - 30);
    c.line(cx + 15, cy - 15, cx + 35, cy - 30);

    // Actuators on joints
    c.noStroke();
    c.fill(c.color(amber, 200));
    [[cx - 35, cy + 30], [cx + 35, cy + 30], [cx - 35, cy - 30], [cx + 35, cy - 30],
     [cx - 15, cy + 15], [cx + 15, cy + 15], [cx - 15, cy - 15], [cx + 15, cy - 15]].forEach(([ax, ay]) => {
      c.ellipse(ax, ay, 7, 7);
    });

    // Temperature indicator
    c.fill(c.color(light, 306));
    c.textSize(9);
    c.textFont("monospace");
    c.textAlign(c.RIGHT, c.BOTTOM);
    c.text("6-AXIS · 23KG", p.width - 8, p.height - 6);
  };
}

function deliverySketch(p: p5, colors: string[], w: number, h: number) {
  const c = p as any;
  const [green, light, lighter, dark, darkest, bg] = colors;

  c.setup = () => {
    const canvasW = Math.min(w, 400);
    const canvasH = (canvasW * h) / w || Math.min(h, 300);
    const canvas = p.createCanvas(canvasW, canvasH);
    canvas.parent((p as any).canvasContainer);

    c.background(c.color(bg));

    // Route nodes
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      x: 30 + i * (p.width - 60) / 7,
      y: p.height / 2 + p.sin(i * 1.2) * 30 - 10,
    }));

    // Connection lines (timing arcs)
    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      const cpX = (n1.x + n2.x) / 2;
      const cpY = Math.min(n1.y, n2.y) - 15;

      c.noFill();
      c.stroke(c.color(green, 100));
      c.strokeWeight(1);
      c.curve(n1.x, n1.y, cpX, cpY, cpX, cpY, n2.x, n2.y);

      // Timing label
      c.noStroke();
      c.fill(c.color(light, 153));
      c.textSize(8);
      c.textFont("monospace");
      c.textAlign(c.CENTER);
      c.text(`${p.floor(p.random(3, 25))}m`, cpX, cpY - 4);
    }

    // Nodes
    c.noStroke();
    nodes.forEach((n, i) => {
      c.fill(i === 0 || i === nodes.length - 1 ? c.color(light, 200) : c.color(green, 150));
      c.ellipse(n.x, n.y, 10, 10);
      c.stroke(c.color(dark));
      c.strokeWeight(1);
      c.noFill();
      c.ellipse(n.x, n.y, 14, 14);
    });

    // Start/End labels
    c.noStroke();
    c.fill(c.color(light, 357));
    c.textSize(8);
    c.textFont("monospace");
    c.textAlign(c.CENTER, c.BOTTOM);
    c.text("DEPOT", nodes[0].x, nodes[0].y - 12);
    c.text("DROP", nodes[nodes.length - 1].x, nodes[nodes.length - 1].y - 12);

    // Stats bar at bottom
    c.fill(c.color(dark));
    c.noStroke();
    c.rect(10, p.height - 16, p.width - 20, 12, 3);
    c.fill(c.color(light, 306));
    c.textSize(8);
    c.textFont("monospace");
    c.textAlign(c.LEFT, c.BOTTOM);
    c.text(`12 stops · ${p.floor(p.random(800, 1500))}m`, 14, p.height - 7);
  };
}

function micromobilitySketch(p: p5, colors: string[], w: number, h: number) {
  const c = p as any;
  const [rose, light, lighter, dark, darkest, bg] = colors;

  c.setup = () => {
    const canvasW = Math.min(w, 400);
    const canvasH = (canvasW * h) / w || Math.min(h, 300);
    const canvas = p.createCanvas(canvasW, canvasH);
    canvas.parent((p as any).canvasContainer);

    c.background(c.color(bg));

    // City grid
    c.stroke(c.color(rose, 12));
    c.strokeWeight(0.5);
    for (let x = 0; x < p.width; x += 25) {
      c.line(x, 0, x, p.height);
    }
    for (let y = 0; y < p.height; y += 25) {
      c.line(0, y, p.width, y);
    }

    // Fleet nodes scattered
    const fleet = Array.from({ length: 15 }, () => ({
      x: p.random(20, p.width - 20),
      y: p.random(20, p.height - 20),
      battery: p.random(15, 95),
    }));

    // Battery indicator circles
    fleet.forEach((n) => {
      const batteryPercent = n.battery;
      const angle = p.map(batteryPercent, 0, 100, 0, p.TWO_PI);

      // Background circle
      c.noFill();
      c.stroke(c.color(dark));
      c.strokeWeight(2);
      c.ellipse(n.x, n.y, 16, 16);

      // Battery arc
      c.stroke(c.color(light, 180));
      c.strokeWeight(2.5);
      c.noFill();
      c.arc(n.x, n.y, 14, 14, -p.HALF_PI, -p.HALF_PI + angle);

      // Inner dot
      c.noStroke();
      c.fill(c.color(light, 100));
      c.ellipse(n.x, n.y, 4, 4);
    });

    // Connection routes
    c.noFill();
    c.stroke(c.color(rose, 30));
    c.strokeWeight(0.8);
    for (let i = 0; i < fleet.length - 1; i += 3) {
      c.line(fleet[i].x, fleet[i].y, fleet[i + 1].x, fleet[i + 1].y);
    }

    // Stats
    c.noStroke();
    c.fill(c.color(light, 306));
    c.textSize(9);
    c.textFont("monospace");
    c.textAlign(c.RIGHT, c.BOTTOM);
    c.text(`FLEET: ${fleet.length} · ${p.floor(fleet.reduce((a, b) => a + b.battery, 0) / fleet.length)}%`, p.width - 8, p.height - 6);
  };
}

function datacenterSketch(p: p5, colors: string[], w: number, h: number) {
  const c = p as any;
  const [slate, light, lighter, dark, darkest, bg] = colors;

  c.setup = () => {
    const canvasW = Math.min(w, 400);
    const canvasH = (canvasW * h) / w || Math.min(h, 300);
    const canvas = p.createCanvas(canvasW, canvasH);
    canvas.parent((p as any).canvasContainer);

    c.background(c.color(bg));

    // Circuit board pattern
    const cols = 12;
    const rows = 8;
    const nodeSpacingX = p.width / (cols + 1);
    const nodeSpacingY = p.height / (rows + 1);

    // Traces
    c.noFill();
    c.stroke(c.color(slate, 20));
    c.strokeWeight(0.8);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (p.random() > 0.5) continue;
        const x1 = nodeSpacingX * (i + 1);
        const y1 = nodeSpacingY * (j + 1);
        const dir = p.random() > 0.5 ? 1 : 0;
        if (dir === 1 && i < cols - 1) {
          c.line(x1, y1, x1 + nodeSpacingX, y1);
        } else if (j < rows - 1) {
          c.line(x1, y1, x1, y1 + nodeSpacingY);
        }
      }
    }

    // Processing nodes
    c.noStroke();
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (p.random() > 0.65) continue;
        const x = nodeSpacingX * (i + 1);
        const y = nodeSpacingY * (j + 1);
        const activity = p.random();
        c.fill(c.color(light, activity * 180));
        if (activity > 0.7) {
          c.ellipse(x, y, 8, 8);
        } else if (activity > 0.4) {
          c.rect(x - 3, y - 3, 6, 6, 1);
        } else {
          c.ellipse(x, y, 4, 4);
        }
      }
    }

    // Central compute core
    const cx = p.width / 2;
    const cy = p.height / 2;
    c.noFill();
    c.stroke(c.color(light, 100));
    c.strokeWeight(1.5);
    c.rect(cx - 15, cy - 20, 30, 40, 3);
    c.stroke(c.color(light, 60));
    c.rect(cx - 10, cy - 15, 8, 12, 1);
    c.rect(cx - 10, cy + 5, 8, 12, 1);
    c.rect(cx + 2, cy - 15, 8, 12, 1);
    c.rect(cx + 2, cy + 5, 8, 12, 1);

    // Status labels
    c.noStroke();
    c.fill(c.color(light, 306));
    c.textSize(9);
    c.textFont("monospace");
    c.textAlign(c.RIGHT, c.BOTTOM);
    c.text(`ACTIVE · TEMP ${(p.floor(p.random(32, 45)) / 1).toFixed(1)}°C`, p.width - 8, p.height - 6);
  };
}

const CATEGORY_SKETCH: Record<PlatformCategory, (p: p5, colors: string[], w: number, h: number) => void> = {
  humanoid: humanoidSketch,
  drone: droneSketch,
  industrial: industrialSketch,
  delivery: deliverySketch,
  micromobility: micromobilitySketch,
  datacenter: datacenterSketch,
};

export function PlatformArtCanvas({ category, accentColor, width = 380, height = 120, className = "" }: PlatformArtCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const config = CATEGORY_CONFIGS[category];
    const sketch = CATEGORY_SKETCH[category];
    const existing = containerRef.current.querySelector<HTMLElement>("[data-p5-canvas]");
    if (existing) existing.remove();

    const p5Container = document.createElement("div");
    p5Container.setAttribute("data-p5-canvas", "");
    p5Container.className = "w-full h-full";
    containerRef.current.appendChild(p5Container);

    let p5Instance: p5 | null = null;
    (p5Container as any).canvasContainer = p5Container;

    const myp5 = new p5((p) => {
      p.setup = () => {
        const canvasW = Math.min(width, 400);
        const canvasH = Math.min(height, 300);
        p.createCanvas(canvasW, canvasH);
        (p as any).canvasContainer = p5Container;
        const canvas = document.querySelector("#" + (p as any)._renderer.elt.id);
        if (canvas) {
          const wrapper = p5Container.querySelector("canvas");
          if (wrapper) {
            wrapper.setAttribute("style", "width:100%;height:100%;object-fit:contain;");
          }
        }
      };
    }, p5Container);

    p5Instance = myp5;

    return () => {
      p5Instance?.remove();
      p5Instance = null;
    };
  }, [mounted, category, accentColor, width, height]);

  return (
    <div ref={containerRef} className={className}>
      {!mounted && (
        <div
          className="w-full h-full"
          style={{ background: accentColor ?? CATEGORY_CONFIGS[category].accent }}
        />
      )}
    </div>
  );
}

export default PlatformArtCanvas;