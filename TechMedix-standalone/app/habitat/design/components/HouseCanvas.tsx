"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Rooms, Walls, Roof, type HouseCanvasProps } from "./house-parts";

export default function HouseCanvas({ plan, camDist }: HouseCanvasProps & { camDist: number }) {
  const W = plan.width;
  return (
    <Canvas shadows camera={{ position: [camDist * 0.75, camDist * 0.55, camDist], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#12111a"]} />
      <fog attach="fog" args={["#12111a", camDist * 1.4, camDist * 3]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[10, 16, 8]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      {/* brand fire accent */}
      <pointLight position={[-8, 4, -6]} intensity={12} color="#cc3d17" distance={30} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#18161f" roughness={1} />
      </mesh>

      <group position={[-(plan.width * 0.35) / 2, 0, -(plan.height * 0.35) / 2]}>
        <Rooms rooms={plan.rooms} />
        <Walls plan={plan} />
        <Roof width={plan.width} height={plan.height} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={4}
        maxDistance={camDist * 2.2}
        maxPolarAngle={Math.PI * 0.49}
        autoRotate
        autoRotateSpeed={0.5}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
