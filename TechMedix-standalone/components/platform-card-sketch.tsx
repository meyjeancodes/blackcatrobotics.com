/**
 * PlatformCardSketch — p5.js HUD overlay for TechMedix platform cards.
 * Transparent canvas: product photo shows through, animated wireframe
 * strokes and particles draw over it in category colors.
 */
import p5 from 'p5';
import { useMemo, useRef, useEffect } from 'react';
import { getChassisForPlatform, type Part, type PartCategory } from "../lib/platforms/parts-catalog";
import { PLATFORM_IMAGE_MAP } from "../lib/platforms/index";

const CAT_COLOR: Record<PartCategory, string> = {
  actuator:       '#FF6B35',
  sensor:         '#38BDF8',
  compute:        '#A78BFA',
  battery:        '#34D399',
  frame:          '#94A3B8',
  drivetrain:     '#F59E0B',
  cooling:        '#22D3EE',
  comms:          '#60A5FA',
  'end-effector': '#F472B6',
  safety:         '#EF4444',
};

interface Pt { x: number; y: number; cat: PartCategory; }
interface Particle { pathIdx: number; pIdx: number; t: number; speed: number; sz: number; }

function parsePts(d: string, cat: PartCategory): Pt[] {
  const nums = d.match(/-?\d+/g);
  if (!nums) return [];
  const pts: Pt[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) pts.push({ x: +nums[i], y: +nums[i + 1], cat });
  return pts;
}

function buildSketch(el: HTMLDivElement, parts: Part[], hov: { current: boolean }, vw: number, vh: number, cw: number, ch: number): p5 {
  const sc = Math.min(cw / vw, ch / vh) * 0.82;
  const ox = (cw - vw * sc) / 2;
  const oy = (ch - vh * sc) / 2;
  const tx = (x: number) => x * sc + ox;
  const ty = (y: number) => y * sc + oy;

  const pathSets: Pt[][] = parts.map(p => parsePts(p.d, p.category).map(pt => ({ x: tx(pt.x), y: ty(pt.y), cat: pt.cat })));

  return new p5(sk => {
    const particles: Particle[] = [];

    sk.setup = () => {
      const cnv = sk.createCanvas(cw, ch);
      cnv.parent(el);
      sk.noFill();
      sk.frameRate(30);

      // Seed particles along each path
      for (let i = 0; i < pathSets.length; i++) {
        const pts = pathSets[i];
        if (pts.length < 2) continue;
        const n = Math.max(1, Math.floor(pts.length / 5));
        for (let j = 0; j < n; j++) {
          particles.push({ pathIdx: i, pIdx: Math.floor(Math.random() * (pts.length - 1)), t: Math.random(), speed: 0.004 + Math.random() * 0.008, sz: 1 + Math.random() * 1.2 });
        }
      }
    };

    sk.draw = () => {
      sk.clear(); // transparent canvas
      const isHov = hov.current;
      const baseA = isHov ? (210 + sk.sin(sk.frameCount * 0.06) * 12) : (100 + sk.sin(sk.frameCount * 0.02) * 45);

      for (const pts of pathSets) {
        if (pts.length < 2) continue;
        const hex = CAT_COLOR[pts[0].cat] ?? '#fff';
        const r = sk.red(sk.color(hex)), g = sk.green(sk.color(hex)), b = sk.blue(sk.color(hex));
        const strokeW = isHov ? Math.max(1.5, sc * 1.5) : Math.max(0.8, sc * 0.9);

        // Glow
        sk.stroke(r, g, b, isHov ? 50 : 22);
        sk.strokeWeight(strokeW * 3);
        sk.beginShape();
        for (const p of pts) sk.vertex(p.x, p.y);
        sk.endShape(sk.CLOSE);

        // Main stroke
        sk.stroke(r, g, b, baseA);
        sk.strokeWeight(strokeW);
        sk.beginShape();
        for (const p of pts) sk.vertex(p.x, p.y);
        sk.endShape(sk.CLOSE);

        // Nodes
        sk.noStroke();
        const nr = isHov ? 2.2 : 1.4;
        sk.fill(r, g, b, isHov ? 180 : 85);
        let idx = 0;
        for (const p of pts) { if (idx % 3 === 0) sk.ellipse(p.x, p.y, nr, nr); idx++; }
      }

      // Particles
      for (const part of particles) {
        const pts = pathSets[part.pathIdx];
        if (!pts || pts.length < 2) continue;
        part.t += part.speed * (isHov ? 3 : 1);
        if (part.t >= 1) { part.pIdx = (part.pIdx + 1) % (pts.length - 1); part.t = 0; }
        const a = pts[part.pIdx], b = pts[Math.min(part.pIdx + 1, pts.length - 1)];
        const px = a.x + (b.x - a.x) * part.t, py = a.y + (b.y - a.y) * part.t;
        const hex = CAT_COLOR[a.cat] ?? '#fff';
        const r = sk.red(sk.color(hex)), g = sk.green(sk.color(hex)), b2 = sk.blue(sk.color(hex));
        sk.noStroke();
        sk.fill(r, g, b2, isHov ? 65 : 28);
        sk.ellipse(px, py, part.sz * 4, part.sz * 4);
        sk.fill(r, g, b2, isHov ? 255 : 190);
        sk.ellipse(px, py, part.sz * 1.5, part.sz * 1.5);
      }

      // Grid on hover
      if (isHov) {
        sk.stroke(255, 12);
        sk.strokeWeight(0.5);
        sk.noFill();
        const gs = sc * 25;
        for (let gx = ox % gs; gx < cw; gx += gs) sk.line(gx, 0, gx, ch);
        for (let gy = oy % gs; gy < ch; gy += gs) sk.line(0, gy, cw, gy);
      }
    };
  });
}

export function PlatformCardSketch({ platformId, onClick }: { platformId: string; onClick?: () => void }) {
  const divRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);
  const hoverRef = useRef(false);
  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);

  const [vw, vh] = useMemo(() => { const p = chassis.viewBox.split(' '); return [parseFloat(p[2] || '200'), parseFloat(p[3] || '360')]; }, [chassis]);

  useEffect(() => {
    if (!divRef.current || !chassis.parts.length) return;
    const w = divRef.current.clientWidth, h = divRef.current.clientHeight;
    if (w === 0 || h === 0) return;
    if (p5Ref.current) { p5Ref.current.remove(); p5Ref.current = null; }
    try { p5Ref.current = buildSketch(divRef.current, chassis.parts, hoverRef, vw, vh, w, h); }
    catch { /* p5 init failed */ }
    return () => { if (p5Ref.current) { p5Ref.current.remove(); p5Ref.current = null; } };
  }, [platformId, chassis, vw, vh]);

  return (
    <div
      ref={divRef}
      className="absolute inset-0 rounded-t-[13px] pointer-events-none"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      onClick={onClick}
      role="img"
      aria-label={`Animated wireframe overlay for ${chassis.label}`}
    />
  );
}
