"use client";

/**
 * PlatformModelView — the uniform 3D representation used by EVERY model card.
 *
 * Guarantees (this is the "uniformity" contract):
 *  - Every platform renders a real, orbiting 3D mesh. Never SVG art, never a
 *    bare photo, never a blank box.
 *  - Official manufacturer URDF is used where one exists; everything else gets
 *    its procedural archetype mesh. Both share the same lighting rig, turntable
 *    framing and interaction model, so the grid reads as one system.
 *  - A styled skeleton paints on the FIRST frame (server-rendered markup), so
 *    there is no white gap while models initialise — the old catalog left tall
 *    empty blocks because each card waited on a 404ing <img>.
 *  - 3D only mounts once the card scrolls near the viewport, and all cards share
 *    a single WebGL context (see lib/platforms/shared-renderer.ts).
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Maximize2 } from "lucide-react";
import type { Archetype } from "@/lib/platforms/archetypes";
import { ARCHETYPE_META } from "@/lib/platforms/archetypes";

interface Props {
  archetype: Archetype;
  /** Official URDF path when the manufacturer publishes one */
  urdfPath?: string | null;
  urdfBadge?: string;
  name: string;
  className?: string;
  onOpen?: () => void;
  /** Show the explode toggle (grid cards do; compact list rows don't) */
  showControls?: boolean;
}

export function PlatformModelView({
  archetype,
  urdfPath,
  urdfBadge,
  name,
  className = "",
  onOpen,
  showControls = true,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<import("@/lib/platforms/shared-renderer").CardScene | null>(null);
  const dragRef = useRef<{ x: number; active: boolean; base: number }>({
    x: 0,
    active: false,
    base: 0,
  });

  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploded, setExploded] = useState(false);

  const meta = ARCHETYPE_META[archetype];
  const accent = meta?.accent ?? "#8b5cf6";
  const isUrdf = !!urdfPath;

  // ── Mount 3D only when the card approaches the viewport ──────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    // The dashboard scrolls inside <main class="overflow-y-auto">, not the
    // window. With the default (viewport) root, cards below main's fold are
    // CLIPPED by the ancestor and never report intersecting — rootMargin does
    // not expand ancestor clip rects. Use the actual scroll container as root.
    let scrollRoot: Element | null = null;
    for (let n = el.parentElement; n; n = n.parentElement) {
      const ov = getComputedStyle(n).overflowY;
      if (ov === "auto" || ov === "scroll") {
        scrollRoot = n;
        break;
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setNear(true);
            if (sceneRef.current) sceneRef.current.visible = true;
          } else if (sceneRef.current) {
            sceneRef.current.visible = false;
          }
        }
      },
      { root: scrollRoot, rootMargin: "500px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── Build the scene ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [{ createCardScene, destroyCardScene, webglAvailable }, meshes, THREE] =
          await Promise.all([
            import("@/lib/platforms/shared-renderer"),
            import("@/lib/platforms/archetype-meshes"),
            import("three"),
          ]);

        if (cancelled) return;
        if (!webglAvailable()) {
          setFailed(true);
          return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Start from the procedural archetype so something correct is always
        // on screen, then upgrade to official URDF geometry if one exists.
        const model = meshes.buildArchetype(archetype);
        const cs = createCardScene(canvas, model, accent);
        if (!cs) {
          setFailed(true);
          return;
        }
        sceneRef.current = cs;
        cs.visible = true;
        setReady(true);

        if (urdfPath) {
          try {
            const mod = await import("urdf-loader");
            const URDFLoader = (mod.default ?? mod) as unknown as new (
              m?: unknown
            ) => {
              packages?: string;
              load: (
                p: string,
                cb: (robot: unknown) => void,
                pg?: unknown,
                err?: (e: unknown) => void
              ) => void;
            };
            const loader = new URDFLoader();
            const base = urdfPath.substring(0, urdfPath.lastIndexOf("/"));
            loader.packages = base;
            await new Promise<void>((resolve) => {
              let settled = false;
              const done = () => {
                if (!settled) {
                  settled = true;
                  resolve();
                }
              };
              // Don't let a slow/missing mesh keep the archetype hidden.
              setTimeout(done, 9000);
              loader.load(
                urdfPath,
                (robot) => {
                  if (cancelled || !sceneRef.current) return done();
                  try {
                    const obj = robot as unknown as import("three").Object3D;
                    obj.rotation.x = -Math.PI / 2;

                    // Normalise URDF to the same framing as archetypes
                    const bbox = new THREE.Box3().setFromObject(obj);
                    const size = new THREE.Vector3();
                    const centre = new THREE.Vector3();
                    bbox.getSize(size);
                    bbox.getCenter(centre);
                    const maxDim = Math.max(size.x, size.y, size.z) || 1;

                    const wrapper = new THREE.Group();
                    obj.position.sub(centre);
                    wrapper.add(obj);
                    wrapper.scale.setScalar(2.0 / maxDim);

                    obj.traverse((o: import("three").Object3D) => {
                      const m = o as import("three").Mesh;
                      if (!m.isMesh) return;
                      m.material = new THREE.MeshStandardMaterial({
                        color: 0xdfe4ec,
                        metalness: 0.42,
                        roughness: 0.38,
                      });
                    });

                    const scn = sceneRef.current;
                    scn.scene.remove(scn.model);
                    meshes.disposeGroup(scn.model);
                    scn.scene.add(wrapper);
                    scn.model = wrapper;
                    scn.parts = [];
                  } catch {
                    /* keep archetype */
                  }
                  done();
                },
                undefined,
                () => done()
              );
            });
          } catch {
            /* URDF unavailable — archetype mesh stays, which is fine */
          }
        }

        cleanup = () => {
          destroyCardScene(cs);
          meshes.disposeGroup(cs.model);
        };
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
      sceneRef.current = null;
    };
  }, [near, archetype, accent, urdfPath]);

  // ── Interaction ──────────────────────────────────────────────────────────
  const setHover = useCallback((v: boolean) => {
    if (sceneRef.current) sceneRef.current.hovered = v;
  }, []);

  const onDown = (e: React.PointerEvent) => {
    dragRef.current.active = true;
    dragRef.current.x = e.clientX;
    dragRef.current.base = sceneRef.current?.dragTheta ?? 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active || !sceneRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    sceneRef.current.dragTheta = dragRef.current.base + dx * 0.012;
  };
  const onUp = () => {
    dragRef.current.active = false;
  };

  const toggleExplode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !exploded;
    setExploded(next);
    if (sceneRef.current) sceneRef.current.exploded = next;
  };

  return (
    <div
      ref={wrapRef}
      className={`group/model relative overflow-hidden rounded-[16px] border border-white/[0.07] ${className}`}
      style={{
        background:
          "radial-gradient(120% 90% at 50% 8%, #171b24 0%, #0c0e13 55%, #07080b 100%)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        onUp();
      }}
    >
      {/* Blueprint grid — paints instantly, so the card is NEVER empty */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(120,160,220,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(120,160,220,0.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(65% 55% at 50% 42%, ${accent}1f 0%, transparent 70%)`,
        }}
      />

      {/* The live 3D surface */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 500ms ease",
          cursor: dragRef.current.active ? "grabbing" : "grab",
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />

      {/* Skeleton while the mesh builds — replaces the old white void */}
      {!ready && !failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="h-11 w-11 animate-spin rounded-full border-2 border-white/10"
            style={{ borderTopColor: accent }}
          />
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-white/30">
            Building {meta?.label ?? "model"}…
          </p>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <Box size={22} className="text-white/25" />
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-white/35">
            {meta?.label}
          </p>
          <p className="text-[0.6rem] leading-snug text-white/25">
            3D unavailable — WebGL is disabled in this browser.
          </p>
        </div>
      )}

      {/* Source-of-truth badge: URDF vs procedural. Always one or the other. */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-[3px] font-mono text-[0.46rem] uppercase tracking-[0.14em] backdrop-blur"
          style={{
            borderColor: isUrdf ? "rgba(52,211,153,.35)" : `${accent}55`,
            background: isUrdf ? "rgba(52,211,153,.10)" : `${accent}18`,
            color: isUrdf ? "#6ee7b7" : accent,
          }}
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: isUrdf ? "#34d399" : accent }}
          />
          {isUrdf ? urdfBadge || "Official URDF" : "3D Model"}
        </span>
      </div>

      {/* Controls */}
      {showControls && ready && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 opacity-0 transition group-hover/model:opacity-100">
          <button
            type="button"
            onClick={toggleExplode}
            className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[0.46rem] uppercase tracking-[0.14em] text-white/70 backdrop-blur transition hover:bg-black/70 hover:text-white"
            style={
              exploded
                ? { borderColor: `${accent}88`, color: accent }
                : undefined
            }
          >
            {exploded ? "Assemble" : "Explode"}
          </button>
          {onOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[0.46rem] uppercase tracking-[0.14em] text-white/70 backdrop-blur transition hover:bg-black/70 hover:text-white"
            >
              <Maximize2 size={8} /> Teardown
            </button>
          )}
        </div>
      )}

      {/* Drag affordance */}
      {ready && (
        <p className="pointer-events-none absolute bottom-3 right-3 font-mono text-[0.44rem] uppercase tracking-[0.18em] text-white/22 opacity-0 transition group-hover/model:opacity-100">
          Drag to orbit
        </p>
      )}

      <span className="sr-only">{name} — interactive 3D model</span>
    </div>
  );
}
