/**
 * Platform URDF configuration.
 * Maps platform IDs to their URDF file paths and metadata.
 * Only platforms with publicly available URDF/mesh files from manufacturers
 * should be listed here.
 *
 * Adding a new platform:
 *  1. Clone https://github.com/unitreerobotics/unitree_ros
 *  2. Copy the robot's URDF + meshes into public/robots/<platform-id>/
 *  3. Add an entry below matching the platform.id from lib/platforms/
 *
 * The URDF loader resolves relative mesh paths (e.g. "meshes/pelvis.dae")
 * from the same directory as the .urdf file.
 */

export interface PlatformUrdf {
  /** Platform ID that matches Knowledge Hub platform definitions */
  id: string;
  /** Display name */
  name: string;
  /** Path relative to public/ directory (e.g. "/robots/unitree-g1/g1_29dof.urdf") */
  urdfPath: string;
  /** Badge label shown on the viewer, e.g. "Official URDF" */
  badge: string;
}

export const PLATFORM_URDFS: PlatformUrdf[] = [
  {
    id: 'unitree-g1',
    name: 'Unitree G1',
    urdfPath: '/robots/unitree-g1/g1_29dof.urdf',
    badge: 'Official URDF',
  },
  {
    id: 'unitree-h1',
    name: 'Unitree H1',
    urdfPath: '/robots/unitree-h1/h1.urdf',
    badge: 'Official URDF',
  },
  {
    id: 'unitree-h1-2',
    name: 'Unitree H1-2',
    urdfPath: '/robots/unitree-h1/h1.urdf',
    badge: 'Official URDF',
  },
  {
    id: 'unitree-h2',
    name: 'Unitree H2',
    urdfPath: '/robots/unitree-h2/H2_dae.urdf',
    badge: 'Official URDF',
  },
  {
    id: 'unitree-go2',
    name: 'Unitree Go2',
    urdfPath: '/robots/unitree-go2/go2_description.urdf',
    badge: 'Official URDF',
  },
  // Aftermarket H1 parts render the real H1 model (no public part-level URDF exists)
  {
    id: 'h1-knee-act',
    name: 'H1 Knee Actuator',
    urdfPath: '/robots/unitree-h1/h1.urdf',
    badge: 'H1 Model',
  },
  {
    id: 'h1-battery',
    name: 'H1 Battery Pack',
    urdfPath: '/robots/unitree-h1/h1.urdf',
    badge: 'H1 Model',
  },
  {
    id: 'h1-shoulder-act',
    name: 'H1 Shoulder Actuator',
    urdfPath: '/robots/unitree-h1/h1.urdf',
    badge: 'H1 Model',
  },
  {
    id: 'h1-dex-hand',
    name: 'H1 Dexterous Hand',
    urdfPath: '/robots/unitree-h1/h1.urdf',
    badge: 'H1 Model',
  },
];

/** Look up URDF config by platform ID */
export function getUrdfForPlatform(platformId: string): PlatformUrdf | null {
  return PLATFORM_URDFS.find((p) => p.id === platformId) ?? null;
}

/** Check if a platform has an available URDF model */
export function hasUrdf(platformId: string): boolean {
  return PLATFORM_URDFS.some((p) => p.id === platformId);
}
