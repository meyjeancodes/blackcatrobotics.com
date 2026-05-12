/**
 * PlatformCardSketch — p5.js instance-mode HUD overlay for TechMedix platform cards.
 *
 * Renders category-colored wireframe parts over a dimmed product photo.
 *  - Hover intensifies brightness and particle count
 *  - Idle state is 25-35% opacity, hover pushes to 80-100%
 */

import p5 from 'p5';
import { useMemo, useRef, useEffect } from 'react';
import { getChassisForPlatform, type Part, type PartCategory } from "../lib/platforms/parts-catalog";
import { PLATFORM_IMAGE_MAP } from "../lib/platforms/index";

const CATEGORY_COLOR_HEX: Record<PartCategory, string> = {
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
interface Particle { pathIdx: number; pIdx: number; t: number; speed: number; size: number; }

function parsePts(d: string, cat: PartCategory): Pt[] {
  const nums = d.match(/-?\d+/g);
  if (!nums) return [];
  const pts: Pt[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) {
    pts.push({ x: +nums[i], y: +nums[i + 1], cat });
  }
  return pts;
}

function createSketch(
  el: HTMLDivElement,
  parts: Part[],
  onHover: { current: boolean },
  imgSrc: string | undefined,
  imgEl: HTMLImageElement | null,
  cw: number,
  ch: number,
  vw: number,
  vh: number,
): p5 {
  const sc = Math.min(cw / vw, ch / vh) * 0.82;
  const ox = (cw - vw * sc) / 2;
  const oy = (ch - vh * sc) / 2;
  const tx = (x: number) => x * sc + ox;
  const ty = (y: number) => y * sc + oy;

  const pathSets: Pt[][] = parts.map(p => {
    const pts = parsePts(p.d, p.category);
    return pts.map(pt => ({ x: tx(pt.x), y: ty(pt.y), cat: pt.cat }));
  });

  return new p5(sk => {
    const particles: Particle[] = [];

    sk.setup = () => {
      const cnv = sk.createCanvas(cw, ch);
      cnv.parent(el);
      sk.noFill();
      sk.frameRate(30);
      sk.imageMode(sk.CORNER);

      for (let i = 0; i < pathSets.length; i++) {
        const pts = pathSets[i];
        if (pts.length < 2) continue;
        const n = Math.max(1, Math.floor(pts.length / 5));
        for (let j = 0; j < n; j++) {
          particles.push({
            pathIdx: i,
            pIdx: Math.floor(Math.random() * (pts.length - 1)),
            t: Math.random(),
            speed: 0.004 + Math.random() * 0.008,
            size: 1 + Math.random() * 1.2,
          });
        }
      }
    };

    function beginPath(pts: Pt[]) {
      sk.beginShape();
      for (const p of pts) sk.vertex(p.x, p.y);
      sk.endShape(sk.CLOSE);
    }

    sk.draw = () => {
      sk.clear();
      const hov = onHover.current;

      // ── Dimmed product photo as base ─────────────────────────────────────
      if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        const iw = imgEl.naturalWidth;
        const ih = imgEl.naturalHeight;
        const imgSc = Math.min(cw / iw, ch / ih);
        const imgW = iw * imgSc;
        const imgH = ih * imgSc;
        const ix = (cw - imgW) / 2;
        const iy = (ch - imgH) / 2;

        sk.tint(255, hov ? 140 : 90);
        sk.image(imgEl, ix, iy, imgW, imgH);
        sk.noTint();
      }

      // ── Glow pass (wider, low alpha) ────────────────────────────────────
      const glowAlpha = hov ? 45 : 20;
      const strokeW = hov ? Math.max(1.5, sc * 1.6) : Math.max(0.8, sc * 0.9);
      const glowW = strokeW * 3;

      for (const pts of pathSets) {
        if (pts.length < 2) continue;
        const hex = CATEGORY_COLOR_HEX[pts[0].cat] ?? '#fff';
        const r = sk.red(sk.color(hex));
        const g = sk.green(sk.color(hex));
        const b = sk.blue(sk.color(hex));

        // Glow
        sk.stroke(r, g, b, glowAlpha);
        sk.strokeWeight(glowW);
        sk.noFill();
        beginPath(pts);

        // Stroke
        const baseA = hov ? (200 + sk.sin(sk.frameCount * 0.04) * 15) : (90 + sk.sin(sk.frameCount * 0.015) * 40);
        sk.stroke(r, g, b, baseA);
        sk.strokeWeight(strokeW);
        beginPath(pts);

        // Nodes
        sk.noStroke();
        const dotAlpha = hov ? 180 : 80;
        const dotR = hov ? 2.5 : 1.4;
        sk.fill(r, g, b, dotAlpha);
        let idx = 0;
        for (const p of pts) {
          if (idx % 3 === 0) sk.ellipse(p.x, p.y, dotR, dotR);
          idx++;
        }
      }

      // ── Particles ──────────────────────────────────────────────────────
      for (const part of particles) {
        const pts = pathSets[part.pathIdx];
        if (!pts || pts.length < 2) continue;

        part.t += part.speed * (hov ? 3 : 1);
        if (part.t >= 1) {
          part.pIdx = (part.pIdx + 1) % (pts.length - 1);
          part.t = 0;
        }

        const a = pts[part.pIdx];
        const b = pts[Math.min(part.pIdx + 1, pts.length - 1)];
        const px = a.x + (b.x - a.x) * part.t;
        const py = a.y + (b.y - a.y) * part.t;
        const hex = CATEGORY_COLOR_HEX[a.cat] ?? '#fff';
        const r = sk.red(sk.color(hex));
        const g = sk.green(sk.color(hex));
        const b2 = sk.blue(sk.color(hex));

        sk.noStroke();
        sk.fill(r, g, b2, hov ? 60 : 25);
        sk.ellipse(px, py, part.size * 4, part.size * 4);
        sk.fill(r, g, b2, hov ? 255 : 180);
        sk.ellipse(px, py, part.size * 1.5, part.size * 1.5);
      }

      // ── Subtle grid on hover ───────────────────────────────────────────
      if (hov) {
        sk.stroke(255, 15);
        sk.strokeWeight(0.5);
        sk.noFill();
        const gs = sc * 20;
        for (let gx = ox % gs; gx < cw; gx += gs) sk.line(gx, 0, gx, ch);
        for (let gy = oy % gs; gy < ch; gy += gs) sk.line(0, gy, cw, gy);
      }
    };
  });
}

interface Props {
  platformId: string;
  onClick?: () => void;
}

export function PlatformCardSketch({ platformId, onClick }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgLoaded = useRef(false);
  const hoverRef = useRef(false);

  const chassis = useMemo(() => getChassisForPlatform(platformId), [platformId]);
  const imgSrc = PLATFORM_IMAGE_MAP[platformId];

  const [vw, vh] = useMemo(() => {
    const p = chassis.viewBox.split(' ');
    return [parseFloat(p[2] || '200'), parseFloat(p[3] || '360')];
  }, [chassis]);

  const cleanup = (p: p5) => { p.remove(); };

  const init = () => {
    if (!divRef.current || !chassis.parts.length) return;
    const el = divRef.current;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w === 0 || h === 0) return;

    if (p5Ref.current) cleanup(p5Ref.current);
    try {
      p5Ref.current = createSketch(el, chassis.parts, hoverRef, imgSrc, imgRef.current, w, h, vw, vh);
    } catch { /* p5 init failed */ }
  };

  useEffect(() => {
    if (!imgSrc) { init(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      imgLoaded.current = true;
      init();
    };
    img.onerror = () => { init(); };
    img.src = imgSrc;
    return () => { img.onload = null; img.onerror = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformId]);

  useEffect(() => {
    return () => { if (p5Ref.current) cleanup(p5Ref.current); };
  }, []);

  return (
    <div
      ref={divRef}
      className="absolute inset-0 rounded-t-[13px]"
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      onClick={onClick}
      role="img"
      aria-label={`Interactive wireframe diagram of ${chassis.label}`}
    />
  );
}
