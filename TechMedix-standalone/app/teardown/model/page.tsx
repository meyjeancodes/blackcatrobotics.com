'use client';

import { useState, useEffect, useRef } from 'react';
import { UrdfRobotViewer } from '../../../components/urdf-robot-viewer';
import { URDF_PART_MAPPINGS } from '@/lib/platforms/urdf-part-mapping';

// Same phase breakdown as /teardown — reused so the full-screen model scrubs
// the same way on its own scroll.
const H1_MESH_MAP = URDF_PART_MAPPINGS['unitree-h1'] ?? {};

const PHASES = [
  { at: 0.0, tag: 'Unitree H1', title: 'Complete System', mtbf: '—', sev: '—', parts: [] as string[] },
  { at: 0.14, tag: 'Head & Sensing', title: '3D LiDAR / Camera', mtbf: '2,800h', sev: 'MED',
    parts: ['imu_link', 'mid360_link', 'd435_left_imager_link', 'd435_rgb_module_link', 'logo_link'] },
  { at: 0.28, tag: 'Torso', title: '864Wh Battery', mtbf: '1,200h', sev: 'HIGH', parts: ['torso_link'] },
  { at: 0.42, tag: 'Shoulders', title: 'Shoulder Actuators', mtbf: '2,100h', sev: 'MED',
    parts: ['left_shoulder_pitch_link', 'left_shoulder_roll_link', 'left_shoulder_yaw_link',
      'right_shoulder_pitch_link', 'right_shoulder_roll_link', 'right_shoulder_yaw_link',
      'left_elbow_link', 'right_elbow_link'] },
  { at: 0.56, tag: 'Hips', title: 'Hip Joints', mtbf: '1,800h', sev: 'HIGH',
    parts: ['left_hip_yaw_link', 'left_hip_roll_link', 'left_hip_pitch_link',
      'right_hip_yaw_link', 'right_hip_roll_link', 'right_hip_pitch_link', 'pelvis'] },
  { at: 0.70, tag: 'Knees', title: 'Knee Actuators', mtbf: '1,400h', sev: 'HIGH',
    parts: ['left_knee_link', 'right_knee_link'] },
  { at: 0.84, tag: 'Feet', title: 'Ankle / Foot IMU', mtbf: '2,800h', sev: 'MED',
    parts: ['left_ankle_link', 'right_ankle_link'] },
  { at: 0.94, tag: 'Full Teardown', title: 'Every Serviceable Part', mtbf: '—', sev: '—',
    parts: ['imu_link', 'torso_link', 'left_shoulder_pitch_link', 'right_shoulder_pitch_link',
      'left_hip_pitch_link', 'right_hip_pitch_link', 'left_knee_link', 'right_knee_link',
      'left_ankle_link', 'right_ankle_link'] },
];

export default function ModelPage() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(PHASES[0]);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  // Scroll-driven rotation + explode (mirrors /teardown behaviour).
  const explodeAmount = progress;

  const sevColor = active.sev === 'HIGH' ? '#ff6b35' : active.sev === 'MED' ? '#c8a96e' : '#7a7a90';

  return (
    <main
      style={{
        margin: 0,
        minHeight: '100vh',
        background: '#f6f5f1',
        color: '#1a1a22',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      <a
        href="/teardown"
        style={{
          position: 'fixed', top: 18, left: 18, zIndex: 10,
          fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#1a1a22', background: '#fff',
          border: '1px solid rgba(0,0,0,0.12)', borderRadius: 999, padding: '8px 14px',
          textDecoration: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
        }}
      >
        ← Teardown
      </a>

      <div ref={stageRef} style={{ position: 'relative', height: '300vh' }}>
        <div
          style={{
            position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <UrdfRobotViewer
              urdfPath="/robots/unitree-h1/h1.urdf"
              label="Unitree H1 · Official URDF"
              height="h-full"
              selectedPartIds={active.parts}
              meshToComponentMap={H1_MESH_MAP}
              hiddenPartIds={[]}
              explodeAmount={explodeAmount}
            />
          </div>

          {/* caption strip — bottom, never covers the model */}
          <div
            style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 24,
              width: 'min(560px, calc(100vw - 48px))', background: '#fff',
              borderRadius: 16, padding: '16px 20px', borderLeft: '4px solid #ff6b35',
              boxShadow: '0 16px 48px rgba(0,0,0,0.18)', textAlign: 'center',
              opacity: active.parts.length ? 1 : 0.55,
            }}
          >
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff6b35', marginBottom: 8 }}>
              {active.tag}
            </div>
            <h3 style={{ fontSize: 20, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{active.title}</h3>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 10, color: '#7a7a90', borderTop: '1px solid #ececf2', paddingTop: 12 }}>
              <span>MTBF<b style={{ color: '#1a1a22', display: 'block', fontSize: 14, marginTop: 2 }}>{active.mtbf}</b></span>
              <span>Severity<b style={{ color: sevColor, display: 'block', fontSize: 14, marginTop: 2 }}>{active.sev}</b></span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
