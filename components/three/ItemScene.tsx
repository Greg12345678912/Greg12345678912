"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Sparkles } from "@react-three/drei";
import { SundaeGlass } from "./SundaeGlass";
import { IceCreamCone } from "./IceCreamCone";
import type { MenuItem, Category } from "@/store/useStore";

const SOFT_SERVE_CATS: Category[] = ["softserve", "hardice"];

interface ItemSceneProps {
  item: MenuItem;
}

function SceneContent({ item }: { item: MenuItem }) {
  const isCone = SOFT_SERVE_CATS.includes(item.category);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#FFF8F0" castShadow />
      <pointLight position={[-3, 2, 3]} intensity={1.0} color={item.color} />
      <pointLight position={[3, -1, 2]} intensity={0.6} color={item.accentColor} />
      <spotLight position={[0, 5, 3]} intensity={1.2} color="#FFF8F0" angle={0.5} penumbra={0.7} />

      <Sparkles
        count={60}
        scale={5}
        size={2}
        speed={0.4}
        opacity={0.6}
        color={item.color}
      />

      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        {isCone ? (
          <IceCreamCone
            color={item.color}
            accentColor={item.accentColor}
            scale={1.2}
            position={[0, -0.3, 0]}
            rotating={false}
          />
        ) : (
          <SundaeGlass
            item={item}
            scale={1.1}
            position={[0, -0.4, 0]}
            rotating={false}
          />
        )}
      </Float>

      <Environment preset="night" />
    </>
  );
}

export function ItemScene({ item }: ItemSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContent item={item} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 2.8}
        autoRotate
        autoRotateSpeed={1.5}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
