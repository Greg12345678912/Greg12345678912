"use client";

import { Suspense, Component } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Sparkles, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { IceCreamCone } from "./IceCreamCone";
import { FloatingParticles } from "./FloatingParticles";
import { useDevice } from "@/lib/useDevice";
import * as THREE from "three";

class PostFXBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function SceneContent({
  isMobile,
  enableTransmission,
  postProcessing,
}: {
  isMobile: boolean;
  enableTransmission: boolean;
  postProcessing: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.3} color="#FFF5E0" />
      <directionalLight
        position={[-3, 6, 5]}
        intensity={1.6}
        color="#FFF8E8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      <directionalLight position={[4, 2, -4]} intensity={0.5} color="#A0C4FF" />
      <pointLight position={[-4, 1, 3]} intensity={0.7} color="#FF6B9D" decay={2} />
      <pointLight position={[3, -1, 2]} intensity={0.45} color="#00C9B1" decay={2} />
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

      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.7}>
        <IceCreamCone
          color="#FF6B9D"
          accentColor="#9B59B6"
          scale={1.1}
          position={[0, 0, 0]}
          rotating={false}
          assemblyId="hero"
          isMobile={isMobile}
          enableTransmission={enableTransmission}
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

      {postProcessing && (
        <PostFXBoundary>
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
        </PostFXBoundary>
      )}
    </>
  );
}

export function HeroScene() {
  const { isMobile, transmission, postProcessing, shadows, dpr, antialias } = useDevice();

  return (
    <Canvas
      camera={{ position: [0, 0.2, 6], fov: 44 }}
      dpr={dpr}
      gl={{
        antialias,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      shadows={shadows}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContent
          isMobile={isMobile}
          enableTransmission={transmission}
          postProcessing={postProcessing}
        />
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
