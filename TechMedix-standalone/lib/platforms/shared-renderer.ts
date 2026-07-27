"use client";

/**
 * Shared WebGL renderer for the model-card grid.
 *
 * PROBLEM: browsers cap live WebGL contexts at ~8-16. The knowledge hub shows
 * 28 platform cards, so one <canvas> with its own context per card is not
 * possible — the oldest contexts get killed and cards go black.
 *
 * SOLUTION: one offscreen WebGLRenderer draws every registered card in turn on
 * a single rAF loop, blitting each frame to that card's lightweight 2D canvas.
 * Cards outside the viewport are skipped entirely (IntersectionObserver driven),
 * so scroll cost stays flat regardless of catalog size.
 */

import * as THREE from "three";

export interface CardScene {
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  model: THREE.Group;
  theta: number;
  dragTheta: number;
  phi: number;
  visible: boolean;
  hovered: boolean;
  exploded: boolean;
  explodeT: number;
  spinners: THREE.Object3D[];
  parts: THREE.Object3D[];
  dist: number;
}

let renderer: THREE.WebGLRenderer | null = null;
let envTex: THREE.Texture | null = null;
let rafId = 0;
let lastT = 0;
const registry = new Set<CardScene>();

const MAX_W = 720;
const MAX_H = 480;

function getRenderer(): THREE.WebGLRenderer | null {
  if (renderer) return renderer;
  if (typeof window === "undefined") return null;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(MAX_W, MAX_H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x000000, 0);
  } catch {
    renderer = null;
  }
  return renderer;
}

/** Studio environment so metal reflects instead of reading as flat clay. */
function getEnv(r: THREE.WebGLRenderer): THREE.Texture | null {
  if (envTex) return envTex;
  try {
    const pmrem = new THREE.PMREMGenerator(r);
    const s = new THREE.Scene();
    const shellGeo = new THREE.BoxGeometry(10, 10, 10);
    const shellMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0x2a3038,
    });
    s.add(new THREE.Mesh(shellGeo, shellMat));

    const panel = (x: number, y: number, z: number, size: number, c: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({ color: c })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      s.add(m);
    };
    panel(0, 4.6, 0, 8, 0xffffff);
    panel(-4, 1.5, 2.5, 5, 0xbcd2ea);
    panel(4, 1.0, -2.5, 5, 0xffd6bb);

    envTex = pmrem.fromScene(s, 0.05).texture;
    shellGeo.dispose();
    shellMat.dispose();
    pmrem.dispose();
  } catch {
    envTex = null;
  }
  return envTex;
}

function lightRig(scene: THREE.Scene, accent: string) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(4, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9dcf5, 0.55);
  fill.position.set(-5, 2, 3);
  scene.add(fill);
  const rim = new THREE.PointLight(new THREE.Color(accent), 2.2, 22);
  rim.position.set(-3.2, 1.6, -3.4);
  scene.add(rim);
}

/** Turntable disc + accent ring so each model sits in a studio, not a void. */
function turntable(scene: THREE.Scene, accent: string) {
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.72, 1.78, 0.05, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f1319, metalness: 0.55, roughness: 0.32 })
  );
  disc.position.y = -1.32;
  scene.add(disc);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.84, 0.014, 8, 96),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(accent),
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.7,
      metalness: 0.3,
      roughness: 0.4,
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.3;
  scene.add(ring);
  return ring;
}

export function createCardScene(
  el: HTMLCanvasElement,
  model: THREE.Group,
  accent: string
): CardScene | null {
  const ctx = el.getContext("2d");
  if (!ctx) return null;

  const r = getRenderer();
  if (!r) return null;

  const scene = new THREE.Scene();
  lightRig(scene, accent);
  const ring = turntable(scene, accent);
  const env = getEnv(r);
  if (env) scene.environment = env;
  scene.add(model);

  const camera = new THREE.PerspectiveCamera(38, 1.5, 0.1, 100);

  const spinners: THREE.Object3D[] = [];
  const parts: THREE.Object3D[] = [];
  model.traverse((o) => {
    if (o.userData?.spin) spinners.push(o);
    if (o.userData?.explode) parts.push(o);
  });
  spinners.push(ring);

  const cs: CardScene = {
    el,
    ctx,
    scene,
    camera,
    model,
    theta: Math.random() * Math.PI * 2,
    dragTheta: 0,
    phi: 0.22,
    visible: false,
    hovered: false,
    exploded: false,
    explodeT: 0,
    spinners,
    parts,
    dist: 5.1,
  };

  registry.add(cs);
  start();
  return cs;
}

export function destroyCardScene(cs: CardScene) {
  registry.delete(cs);
  if (registry.size === 0 && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function drawOne(cs: CardScene, dt: number) {
  const r = getRenderer();
  if (!r) return;

  const w = cs.el.clientWidth;
  const h = cs.el.clientHeight;
  if (w < 2 || h < 2) return;

  const dpr = Math.min(window.devicePixelRatio, 2);
  const pw = Math.min(Math.round(w * dpr), MAX_W);
  const ph = Math.min(Math.round(h * dpr), MAX_H);

  if (cs.el.width !== pw || cs.el.height !== ph) {
    cs.el.width = pw;
    cs.el.height = ph;
  }

  cs.theta += dt * (cs.hovered ? 0.62 : 0.2);

  const target = cs.exploded ? 1 : 0;
  cs.explodeT += (target - cs.explodeT) * Math.min(1, dt * 6);
  for (const p of cs.parts) {
    const home = p.userData.home as THREE.Vector3 | undefined;
    const dir = p.userData.explode as THREE.Vector3 | undefined;
    if (home && dir) p.position.copy(home).addScaledVector(dir, cs.explodeT);
  }

  for (const s of cs.spinners) s.rotation.y += dt * (cs.hovered ? 5.5 : 1.6);

  const a = cs.theta + cs.dragTheta;
  cs.camera.aspect = pw / ph;
  cs.camera.position.set(
    Math.sin(a) * cs.dist * Math.cos(cs.phi),
    Math.sin(cs.phi) * cs.dist + 0.35,
    Math.cos(a) * cs.dist * Math.cos(cs.phi)
  );
  cs.camera.lookAt(0, -0.1, 0);
  cs.camera.updateProjectionMatrix();

  r.setSize(pw, ph, false);
  r.render(cs.scene, cs.camera);

  cs.ctx.clearRect(0, 0, pw, ph);
  cs.ctx.drawImage(r.domElement, 0, 0, pw, ph, 0, 0, pw, ph);
}

function loop(t: number) {
  rafId = requestAnimationFrame(loop);
  const dt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;
  for (const cs of registry) if (cs.visible) drawOne(cs, dt);
}

function start() {
  if (rafId) return;
  lastT = performance.now();
  rafId = requestAnimationFrame(loop);
}

/** Feature probe so the UI can show a graceful message if WebGL is off. */
export function webglAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
