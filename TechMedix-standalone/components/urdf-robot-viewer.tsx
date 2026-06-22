'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// ─── The actual URDF viewer — loaded ONLY in the browser via dynamic import ──

const UrdfViewerInner = dynamic(
  () => import('./urdf-viewer-inner'),
  { ssr: false, loading: () => <UrdfLoadingShell /> }
);

// ─── Loading shell (no URDF code imported) ────────────────────────────────────

function UrdfLoadingShell() {
  return (
    <div className="relative flex items-center justify-center rounded-xl border border-white/[0.06] bg-[#0c0c14] h-[420px]">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 70%)' }} />
      <Loader2 className="h-6 w-6 animate-spin text-white/20" />
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.50rem] uppercase tracking-[0.2em] text-white/20">
        Loading model…
      </p>
    </div>
  );
}

// ─── Wrapper that dynamically switches between URDF and fallback ──────────────

interface Props {
 urdfPath: string;
 label?: string;
 height?: string;
 selectedPartId?: string | null;
 exploded?: boolean;
 wireframe?: boolean;
 onPartClick?: (partName: string) => void;
 /** Maps URDF mesh names → parts-catalog component IDs */
 meshToComponentMap?: Record<string, string>;
}

export function UrdfRobotViewer({ urdfPath, label, height, selectedPartId, exploded = false, wireframe, onPartClick, meshToComponentMap }: Props) {
 const [error, setError] = useState<string | null>(null);

 return (
 <div className={height ?? 'h-[420px]'}>
 <UrdfViewerInner
 key={urdfPath}
 urdfPath={urdfPath}
 label={label}
 height="h-full"
 selectedPartId={selectedPartId}
 exploded={exploded}
 wireframe={wireframe}
 onPartClick={onPartClick}
 meshToComponentMap={meshToComponentMap}
 />
 </div>
 );
}

// ─── URDF platform registry ├── maps platform slugs to their URDF paths ─────────

export interface UrdfPlatformEntry {
  name: string;
  urdfPath: string;
  badge?: string;
}

export const URDF_ROBOTS: Record<string, UrdfPlatformEntry> = {
  /*
   * To add a new robot with real URDF/STL models:
   *  1. Clone https://github.com/unitreerobotics/unitree_ros
   *  2. Copy the robot's URDF + meshes to public/robots/<id>/
   *  3. Add an entry below
   */
  'unitree-h1': {
    name: 'Unitree H1',
    urdfPath: '/robots/unitree-h1/h1.urdf',
    badge: 'Official URDF',
  },
  'unitree-go2': {
    name: 'Unitree Go2',
    urdfPath: '/robots/unitree-go2/go2_description.urdf',
    badge: 'Official URDF',
  },
  'unitree-h2': {
    name: 'Unitree H2',
    urdfPath: '/robots/unitree-h2/H2_dae.urdf',
    badge: 'Official URDF',
  },
  'unitree-g1': {
    name: 'Unitree G1',
    urdfPath: '/robots/unitree-g1/g1_29dof.urdf',
    badge: 'Official URDF',
  },
};
