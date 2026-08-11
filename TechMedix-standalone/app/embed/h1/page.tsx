'use client';

import { UrdfRobotViewer } from '@/components/urdf-robot-viewer';
import { URDF_PART_MAPPINGS } from '@/lib/platforms/urdf-part-mapping';

// Lightweight, chromeless 3D embed for the marketing homepage. Renders ONLY the
// URDF viewer (no nav/header) so it can be dropped into the static index.html
// via an <iframe>. The same UrdfRobotViewer that powers /teardown/model — proven
// to mount WebGL and load the H1 URDF without errors.
const H1_MESH_MAP = URDF_PART_MAPPINGS['unitree-h1'] ?? {};

export default function EmbedH1() {
  return (
    <main
      style={{
        margin: 0,
        minHeight: '100vh',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <UrdfRobotViewer
        urdfPath="/robots/unitree-h1/h1.urdf"
        label="Unitree H1 · Official URDF"
        height="h-screen"
        meshToComponentMap={H1_MESH_MAP}
        hiddenPartIds={[]}
        explodeAmount={0}
      />
    </main>
  );
}
