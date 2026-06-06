"use client";

import { Suspense, useRef, useEffect, Component } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  Sparkles,
  ContactShadows,
} from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { SundaeGlass } from "./SundaeGlass";
import { IceCreamCone } from "./IceCreamCone";
import { useDevice } from "@/lib/useDevice";
import type { MenuItem, Category } from "@/store/useStore";
import * as THREE from "three";

class PostFXBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const CONE_CATS: Category[] = ["softserve", "hardice", "churros"];

/** Smooth camera choreography when item changes */
function CameraRig({ itemId }: { itemId: string }) {
  const { camera } = useThree();
  const prevId = useRef(itemId);
  const anim = useRef({ progress: 1, active: false });
  const basePos = useRef(new THREE.Vector3(0, 0.5, 5));

  useEffect(() => {
    if (prevId.current !== itemId) {
      prevId.current = itemId;
      anim.current = { progress: 0, active: true };
    }
  }, [itemId]);

  useFrame((_, delta) => {
    if (!anim.current.active) return;
    anim.current.progress = Math.min(1, anim.current.progress + delta * 1.4);
    const p = anim.current.progress;

    // Arc: pull back (0→0.45), pause, push forward (0.55→1)
    const pullback = Math.sin(p * Math.PI) * 1.2;
    const sideSwing = Math.sin(p * Math.PI) * 0.55;

    camera.position.set(
      basePos.current.x + sideSwing,
      basePos.current.y,
      basePos.current.z + pullback
    );
    camera.lookAt(0, 0.2, 0);

    if (p >= 1) {
      camera.position.copy(basePos.current);
      anim.current.active = false;
    }
  });

  return null;
}

interface SceneContentProps {
  item: MenuItem;
  isMobile: boolean;
}

function SceneContent({ item, isMobile }: SceneContentProps) {
  const isCone = CONE_CATS.includes(item.category);

  return (
    <>
      <ambientLight intensity={0.35} color="#FFF5E0" />
      {/* Strong key light from upper-left — studio food photography */}
      <directionalLight
        position={[-2.5, 6, 4]}
        intensity={2.0}
        color="#FFF8EC"
        castShadow
        shadow-mapSize={[isMobile ? 512 : 1024, isMobile ? 512 : 1024]}
        shadow-bias={-0.0008}
      />
      {/* Cool rim from behind */}
      <directionalLight position={[3.5, 1.5, -4]} intensity={0.6} color="#B0CCFF" />
      {/* Item color fill */}
      <pointLight position={[-3, 0.5, 3]} intensity={1.1} color={item.color} decay={2} />
      {/* Accent */}
      <pointLight position={[3, -0.5, 2]} intensity={0.55} color={item.accentColor} decay={2} />
      {/* Warm underside bounce */}
      <pointLight position={[0, -2.5, 2.5]} intensity={0.3} color="#FF8C42" decay={2} />

      {!isMobile && (
        <Sparkles
          count={45}
          scale={5}
          size={1.8}
          speed={0.35}
          opacity={0.5}
          color={item.color}
        />
      )}

      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.5}>
        {isCone ? (
          <IceCreamCone
            color={item.color}
            accentColor={item.accentColor}
            scale={1.2}
            position={[0, -0.3, 0]}
            rotating={false}
            assemblyId={item.id}
            isMobile={isMobile}
          />
        ) : (
          <SundaeGlass
            item={item}
            scale={1.15}
            position={[0, -0.5, 0]}
            rotating={false}
            assemblyId={item.id}
            isMobile={isMobile}
          />
        )}
      </Float>

      <ContactShadows
        position={[0, isCone ? -2.0 : -2.3, 0]}
        opacity={0.45}
        scale={6}
        blur={2.8}
        far={4.5}
        color="#110022"
        frames={isMobile ? 1 : 2}
      />

      <Environment preset="studio" />

      {!isMobile && (
        <PostFXBoundary>
          <EffectComposer>
            <DepthOfField
              focusDistance={0.005}
              focalLength={0.055}
              bokehScale={2.5}
              height={480}
            />
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.5}
              luminanceSmoothing={0.9}
              radius={0.75}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.12} darkness={0.55} />
          </EffectComposer>
        </PostFXBoundary>
      )}
    </>
  );
}

interface ItemSceneProps {
  item: MenuItem;
}

export function ItemScene({ item }: ItemSceneProps) {
  const { isMobile } = useDevice();

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 48 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: !isMobile,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        failIfMajorPerformanceCaveat: false,
      }}
      shadows={!isMobile}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <SceneContent item={item} isMobile={isMobile} />
      </Suspense>
      <CameraRig itemId={item.id} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.55}
        minPolarAngle={Math.PI / 2.9}
        autoRotate
        autoRotateSpeed={1.2}
        rotateSpeed={0.5}
        enableDamping
        dampingFactor={0.07}
      />
    </Canvas>
  );
}
