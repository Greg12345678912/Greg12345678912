"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Sparkles } from "@react-three/drei";
import { IceCreamCone } from "./IceCreamCone";
import { FloatingParticles } from "./FloatingParticles";

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#FFF8F0" castShadow />
      <pointLight position={[-4, 2, 3]} intensity={0.8} color="#FF6B9D" />
      <pointLight position={[4, -2, 3]} intensity={0.6} color="#9B59B6" />
      <pointLight position={[0, 4, -2]} intensity={0.4} color="#00C9B1" />
      <spotLight position={[0, 6, 4]} intensity={1.0} color="#FFF8F0" angle={0.4} penumbra={0.8} />

      <Sparkles count={80} scale={8} size={1.5} speed={0.3} opacity={0.5} color="#F4C430" />

      <FloatingParticles count={50} />

      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8}>
        <IceCreamCone
          color="#FF6B9D"
          accentColor="#9B59B6"
          scale={1.1}
          position={[0, 0, 0]}
          rotating={false}
        />
      </Float>

      {/* Small background cones */}
      <Float speed={1.0} rotationIntensity={0.8} floatIntensity={0.6}>
        <IceCreamCone
          color="#00C9B1"
          accentColor="#F4C430"
          scale={0.5}
          position={[-3.5, -0.5, -2]}
          rotating={true}
        />
      </Float>

      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1.0}>
        <IceCreamCone
          color="#FF8C42"
          accentColor="#FF6B9D"
          scale={0.45}
          position={[3.2, 0.3, -2.5]}
          rotating={true}
        />
      </Float>

      <Float speed={0.9} rotationIntensity={1.0} floatIntensity={0.5}>
        <IceCreamCone
          color="#9B59B6"
          accentColor="#00C9B1"
          scale={0.35}
          position={[2.5, -1.5, -3]}
          rotating={true}
        />
      </Float>

      <Environment preset="night" />
    </>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
        autoRotate={false}
        rotateSpeed={0.4}
      />
    </Canvas>
  );
}
