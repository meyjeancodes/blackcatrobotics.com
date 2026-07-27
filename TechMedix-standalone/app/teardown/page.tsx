'use client';

import { useEffect, useRef, useState } from 'react';
import { UrdfRobotViewer } from '@/components/urdf-robot-viewer';

/**
 * Live 3D teardown of the Unitree H1 — scroll-driven.
 * The robot rotates as you scroll; each phase highlights a real component
 * group (mapped to its URDF link name) and shows the Knowledge-Moat failure
 * mode (MTBF + severity).
 */

// Maps a scroll phase → the URDF link names that should highlight.
// H1 link names from public/robots/unitree-h1/h1.urdf.
const PHASES = [
  {
    at: 0.0,
    tag: 'Unitree H1',
    title: 'Complete System',
    desc: 'Thousands of parts in sync. Scroll to rotate the model and inspect the components that fail first.',
    mtbf: '—',
    sev: '—',
    parts: [] as string[],
  },
  {
    at: 0.14,
    tag: 'Head & Sensing',
    title: '3D LiDAR / Camera',
    desc: 'Head IMU and camera drift; degraded depth perception triggers cautious gait and slower navigation.',
    mtbf: '2,800h',
    sev: 'MED',
    parts: ['imu_link', 'mid360_link', 'd435_left_imager_link', 'd435_rgb_module_link', 'logo_link'],
  },
  {
    at: 0.28,
    tag: 'Torso',
    title: '864Wh Battery',
    desc: 'Cell-group voltage imbalance from repeated high-current discharge. Runtime drops below 45 min; BMS faults.',
    mtbf: '1,200h',
    sev: 'HIGH',
    parts: ['torso_link'],
  },
  {
    at: 0.42,
    tag: 'Shoulders',
    title: 'Shoulder Actuators',
    desc: 'Harmonic-drive wear from repetitive manipulation cycles. Position error and reduced payload accuracy.',
    mtbf: '2,100h',
    sev: 'MED',
    parts: [
      'left_shoulder_pitch_link',
      'left_shoulder_roll_link',
      'left_shoulder_yaw_link',
      'right_shoulder_pitch_link',
      'right_shoulder_roll_link',
      'right_shoulder_yaw_link',
      'left_elbow_link',
      'right_elbow_link',
    ],
  },
  {
    at: 0.56,
    tag: 'Hips',
    title: 'Hip Joints',
    desc: 'Wave-generator bearing pitting under lateral load. Side-step gait shows lean drift and clicking.',
    mtbf: '1,800h',
    sev: 'HIGH',
    parts: [
      'left_hip_yaw_link',
      'left_hip_roll_link',
      'left_hip_pitch_link',
      'right_hip_yaw_link',
      'right_hip_roll_link',
      'right_hip_pitch_link',
      'pelvis',
    ],
  },
  {
    at: 0.70,
    tag: 'Knees',
    title: 'Knee Actuators',
    desc: 'Flexspline fatigue from cyclical high-torque loading — torque ripple, grinding, gait instability on inclines.',
    mtbf: '1,400h',
    sev: 'HIGH',
    parts: ['left_knee_link', 'right_knee_link'],
  },
  {
    at: 0.84,
    tag: 'Feet',
    title: 'Ankle / Foot IMU',
    desc: 'Magnetic position sensor degradation. Robot fails self-check and refuses to stand.',
    mtbf: '2,800h',
    sev: 'MED',
    parts: ['left_ankle_link', 'right_ankle_link'],
  },
  {
    at: 0.94,
    tag: 'Full Teardown',
    title: 'Every Serviceable Part',
    desc: 'Head, core, actuators, encoders, hands, feet — each tracked with its own repair protocol in the Knowledge Moat.',
    mtbf: '—',
    sev: '—',
    parts: [
      'imu_link',
      'torso_link',
      'left_shoulder_pitch_link',
      'right_shoulder_pitch_link',
      'left_hip_pitch_link',
      'right_hip_pitch_link',
      'left_knee_link',
      'right_knee_link',
      'left_ankle_link',
      'right_ankle_link',
    ],
  },
];

export default function TeardownPage() {
  const [progress, setProgress] = useState(0); // 0..1
  const [active, setActive] = useState(PHASES[0]);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(p);
      let ph = PHASES[0];
      for (const ph2 of PHASES) if (p >= ph2.at) ph = ph2;
      setActive(ph);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // TEMP DEBUG: surface URDF load truth on screen (remove after fix)
  const [dbg, setDbg] = useState<any>(null);
  useEffect(() => {
    const t = setInterval(() => {
      const d = (window as any).__urdfDebug;
      if (d) setDbg(d);
    }, 500);
    return () => clearInterval(t);
  }, []);

  // Map scroll → continuous Y rotation (one full turn across the band)
  const rotation = progress * Math.PI * 2;

  return (
    <main className="td-root">
      {/* HERO */}
      <section className="td-hero">
        <p className="td-eyebrow">TechMedix inside · Unitree H1</p>
        <h1 className="td-h1">
          We know exactly <em>what breaks.</em>
        </h1>
        <p className="td-sub">
          A live 3D model of the Unitree H1. Scroll to rotate it and inspect every
          serviceable component — each tracked in the Knowledge Moat with real
          failure modes, MTBF, and repair protocols.
        </p>
        <div className="td-scrollhint">↓ scroll to inspect</div>
      </section>

      {/* STAGE: 300vh pinned scroll band */}
      <div className="td-stage" ref={stageRef}>
        <div className="td-sticky">
          <div className="td-canvaswrap">
            <UrdfRobotViewer
              urdfPath="/robots/unitree-h1/h1.urdf"
              label="Unitree H1 · Official URDF"
              height="h-full"
              selectedPartId={null}
              meshToComponentMap={{}}
              scrollRotation={rotation}
              hiddenPartIds={[]}
            />
            {/* TEMP DEBUG HUD — remove after fix */}
            {dbg && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 50,
                  background: 'rgba(0,0,0,0.7)',
                  border: '1px solid #444',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  color: '#9fe6a0',
                  maxWidth: 240,
                  lineHeight: 1.5,
                  pointerEvents: 'none',
                }}
              >
                <div>URDF: {dbg.loaded ? 'LOADED' : 'FAILED'}</div>
                {dbg.error && <div style={{ color: '#ff6b6b' }}>err: {dbg.error}</div>}
                {dbg.loaded && (
                  <>
                    <div>meshes: {dbg.meshCount}</div>
                    <div>
                      box: {dbg.box?.x} × {dbg.box?.y} × {dbg.box?.z}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* SVG scan line + halo overlay */}
            <div className={`td-scan ${active.parts.length ? 'on' : ''}`} />
            <div className="td-rail">
              <i style={{ height: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>

          {/* CALLOUT */}
          <div
            className={`td-callout sev-${active.sev}`}
            style={{ opacity: active.parts.length ? 1 : 0.55 }}
          >
            <div className="td-tag">{active.tag}</div>
            <h3>{active.title}</h3>
            <p>{active.desc}</p>
            <div className="td-meta">
              <span>
                MTBF<b>{active.mtbf}</b>
              </span>
              <span>
                Severity
                <b
                  style={{
                    color:
                      active.sev === 'HIGH'
                        ? '#ff6b35'
                        : active.sev === 'MED'
                        ? '#c8a96e'
                        : '#7a7a90',
                  }}
                >
                  {active.sev}
                </b>
              </span>
            </div>
          </div>

          {/* HUD */}
          <div className="td-hud">
            <div className="td-idx">
              {String(PHASES.indexOf(active) + 1).padStart(2, '0')} / {PHASES.length.toString().padStart(2, '0')}
            </div>
            <div className="td-phase">{active.title}</div>
          </div>
        </div>
      </div>

      {/* OUTRO */}
      <section className="td-outro">
        <h2>Every component, tracked.</h2>
        <p>
          The Knowledge Moat holds the real failure modes, MTBF, and repair
          protocols for the Unitree H1 — so TechMedix keeps your fleet running
          instead of guessing.
        </p>
        <a className="td-cta" href="/">
          ← Back to BlackCat Robotics
        </a>
      </section>

      <style jsx>{`
        .td-root {
          background: #0d0d12;
          color: #f2f2f5;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }
        .td-hero {
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
          position: relative;
        }
        .td-eyebrow {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ff6b35;
          background: rgba(255, 107, 53, 0.08);
          border: 1px solid rgba(255, 107, 53, 0.18);
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 22px;
        }
        .td-h1 {
          font-size: clamp(34px, 6vw, 72px);
          line-height: 1.02;
          letter-spacing: -0.03em;
          margin: 0 0 20px;
          font-weight: 800;
        }
        .td-h1 em {
          color: #ff6b35;
          font-style: italic;
        }
        .td-sub {
          max-width: 620px;
          color: #9a9aa8;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 auto;
        }
        .td-scrollhint {
          margin-top: 48px;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6a6a7a;
          animation: td-bob 1.8s ease-in-out infinite;
        }
        @keyframes td-bob {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        .td-stage {
          position: relative;
          height: 300vh;
        }
        .td-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .td-canvaswrap {
          position: absolute;
          inset: 0;
        }
        .td-scan {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 140px;
          background: linear-gradient(180deg, rgba(255, 107, 53, 0.16), transparent);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .td-scan.on {
          opacity: 1;
        }
        .td-rail {
          position: absolute;
          right: 36px;
          top: 18vh;
          height: 64vh;
          width: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          pointer-events: none;
        }
        .td-rail i {
          display: block;
          width: 100%;
          background: #ff6b35;
          border-radius: 3px;
          transition: height 0.1s linear;
        }
        .td-callout {
          position: absolute;
          left: 48px;
          bottom: 12vh;
          width: 340px;
          max-width: calc(100vw - 96px);
          background: #fff;
          color: #1a1a22;
          border-radius: 18px;
          padding: 20px 22px;
          border-left: 4px solid #ff6b35;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
          transition: opacity 0.4s, border-color 0.4s;
          z-index: 5;
        }
        .td-callout.sev-HIGH {
          border-color: #ff3b1f;
          box-shadow: 0 0 28px rgba(255, 59, 31, 0.3), 0 16px 48px rgba(0, 0, 0, 0.4);
        }
        .td-callout.sev-MED {
          border-color: #c8a96e;
        }
        .td-tag {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ff6b35;
          margin-bottom: 8px;
        }
        .td-callout h3 {
          font-size: 20px;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
        }
        .td-callout p {
          font-size: 13px;
          line-height: 1.6;
          color: #4a4a58;
          margin: 0;
        }
        .td-meta {
          margin-top: 14px;
          display: flex;
          gap: 18px;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          color: #7a7a90;
          border-top: 1px solid #ececf2;
          padding-top: 12px;
        }
        .td-meta b {
          color: #1a1a22;
          display: block;
          font-size: 14px;
          margin-top: 2px;
        }
        .td-hud {
          position: absolute;
          top: 8vh;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          pointer-events: none;
          z-index: 5;
        }
        .td-idx {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #ff6b35;
        }
        .td-phase {
          font-size: 13px;
          color: #b8b8c4;
          letter-spacing: 0.04em;
          margin-top: 2px;
        }
        .td-outro {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
        }
        .td-outro h2 {
          font-size: clamp(26px, 4vw, 44px);
          letter-spacing: -0.02em;
          margin: 0 0 16px;
        }
        .td-outro p {
          max-width: 560px;
          color: #9a9aa8;
          line-height: 1.6;
          margin: 0 0 28px;
        }
        .td-cta {
          display: inline-block;
          background: #ff6b35;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 22px;
          border-radius: 10px;
          transition: opacity 0.15s;
        }
        .td-cta:hover {
          opacity: 0.88;
        }
        @media (max-width: 820px) {
          .td-callout {
            left: 14px;
            right: 14px;
            width: auto;
            bottom: 8vh;
          }
          .td-rail {
            right: 14px;
          }
        }
      `}</style>
    </main>
  );
}
