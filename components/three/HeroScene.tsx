"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Sparkles, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { IceCreamCone } from "./IceCreamCone";
import { FloatingParticles } from "./FloatingParticles";
import { useDevice } from "@/lib/useDevice";
import * as THREE from "three";

function SceneContent({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      {/* Warm key light from front-left — food photography style */}
      <ambientLight intensity={0.3} color="#FFF5E0" />
      <directionalLight
        position={[-3, 6, 5]}
        intensity={1.6}
        color="#FFF8E8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      {/* Rim light — cool blue from behind */}
      <directionalLight position={[4, 2, -4]} intensity={0.5} color="#A0C4FF" />
      {/* Fill light — warm pink */}
      <pointLight position={[-4, 1, 3]} intensity={0.7} color="#FF6B9D" decay={2} />
      {/* Teal accent */}
      <pointLight position={[3, -1, 2]} intensity={0.45} color="#00C9B1" decay={2} />
      {/* Bottom bounce */}
      <pointLight position={[0, -3, 3]} intensity={0.25} color="#FF8C42" decay={2} />

      {!isMobile && (
        <Sparkles
          count={50}
          scale={9}
          size={1.2}
          speed={0.25}
          opacity={0.35}
          color="#F4C430"
        />
      )}

      <FloatingParticles count={isMobile ? 25 : 50} />

      {/* Hero cone */}
      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.7}>
        <IceCreamCone
          color="#FF6B9D"
          accentColor="#9B59B6"
          scale={1.1}
          position={[0, 0, 0]}
          rotating={false}
          assemblyId="hero"
          isMobile={isMobile}
        />
      </Float>

      {!isMobile && (
        <>
          <Float speed={1.0} rotationIntensity={0.9} floatIntensity={0.6}>
            <IceCreamCone
              color="#00C9B1"
              accentColor="#F4C430"
              scale={0.48}
              position={[-3.6, -0.5, -2.2]}
              rotating
              assemblyId="bg1"
              isMobile
            />
          </Float>
          <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.0}>
            <IceCreamCone
              color="#FF8C42"
              accentColor="#FF6B9D"
              scale={0.42}
              position={[3.3, 0.4, -2.6]}
              rotating
              assemblyId="bg2"
              isMobile
            />
          </Float>
          <Float speed={0.9} rotationIntensity={1.1} floatIntensity={0.5}>
            <IceCreamCone
              color="#9B59B6"
              accentColor="#00C9B1"
              scale={0.33}
              position={[2.4, -1.6, -3.2]}
              rotating
              assemblyId="bg3"
              isMobile
            />
          </Float>
        </>
      )}

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.35}
        scale={10}
        blur={3}
        far={5}
        color="#220033"
        frames={1}
      />

      <Environment preset="sunset" />

      {!isMobile && (
        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.85}
            radius={0.7}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
      )}
    </>
  );
}

export function HeroScene() {
  const { isMobile } = useDevice();

  return (
    <Canvas
      camera={{ position: [0, 0.2, 6], fov: 44 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: !isMobile,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      shadows={!isMobile}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContent isMobile={isMobile} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.75}
        minPolarAngle={Math.PI / 3.2}
        rotateSpeed={0.45}
      />
    </Canvas>
  );
}
