"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { SCENES, getSceneItem } from "@/lib/scenes";
import type { SceneDefinition } from "@/lib/scenes";
import { IceCreamCone } from "@/components/three/IceCreamCone";
import { SundaeGlass } from "@/components/three/SundaeGlass";
import { GLBModel } from "@/components/three/GLBModel";
import { SceneParticles } from "./SceneParticles";
import { easeOutBack } from "@/lib/easing";

const CONE_CATS = new Set(["softserve", "hardice", "churros"]);

// ─── Camera FOV controller ───────────────────────────────────────────────────
function CameraController({ fov }: { fov: number }) {
  const { camera } = useThree();
  const targetFov = useRef(fov);

  useEffect(() => {
    targetFov.current = fov;
  }, [fov]);

  useFrame(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    if (Math.abs(camera.fov - targetFov.current) > 0.02) {
      camera.fov += (targetFov.current - camera.fov) * 0.04;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// ─── Background + fog controller ────────────────────────────────────────────
function FogController({ scene }: { scene: SceneDefinition }) {
  const { gl, scene: threeScene } = useThree();
  const bgColor = useRef(new THREE.Color(scene.bgFrom));
  const fogColor = useRef(new THREE.Color(scene.fogColor));
  const targetBg = useRef(new THREE.Color(scene.bgFrom));
  const targetFog = useRef(new THREE.Color(scene.fogColor));
  const targetDensity = useRef(scene.fogDensity);

  useEffect(() => {
    if (!threeScene.fog) {
      threeScene.fog = new THREE.FogExp2(scene.fogColor, scene.fogDensity);
    }
  }, [scene.fogColor, scene.fogDensity, threeScene]);

  useEffect(() => {
    targetBg.current.set(scene.bgFrom);
    targetFog.current.set(scene.fogColor);
    targetDensity.current = scene.fogDensity;
  }, [scene]);

  useFrame(() => {
    bgColor.current.lerp(targetBg.current, 0.04);
    fogColor.current.lerp(targetFog.current, 0.04);
    gl.setClearColor(bgColor.current, 1);
    if (threeScene.fog instanceof THREE.FogExp2) {
      threeScene.fog.color.copy(fogColor.current);
      threeScene.fog.density += (targetDensity.current - threeScene.fog.density) * 0.04;
    }
  });

  return null;
}

// ─── Dynamic lighting that lerps between scene colors ────────────────────────
function SceneLights({ scene }: { scene: SceneDefinition }) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  const targetKey = useRef(new THREE.Color(scene.keyLight));
  const targetFill = useRef(new THREE.Color(scene.fillLight));
  const targetRim = useRef(new THREE.Color(scene.rimLight));
  const targetKeyInt = useRef(scene.keyIntensity);

  useEffect(() => {
    targetKey.current.set(scene.keyLight);
    targetFill.current.set(scene.fillLight);
    targetRim.current.set(scene.rimLight);
    targetKeyInt.current = scene.keyIntensity;
  }, [scene]);

  useFrame(() => {
    const s = 0.05;
    if (keyRef.current) {
      keyRef.current.color.lerp(targetKey.current, s);
      keyRef.current.intensity += (targetKeyInt.current - keyRef.current.intensity) * s;
    }
    if (fillRef.current) fillRef.current.color.lerp(targetFill.current, s);
    if (rimRef.current) rimRef.current.color.lerp(targetRim.current, s);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        ref={keyRef}
        position={[-3, 3.5, 5]}
        intensity={scene.keyIntensity}
        color={scene.keyLight}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.001}
      />
      <pointLight
        ref={fillRef}
        position={[-4, 0, 4]}
        intensity={1.0}
        color={scene.fillLight}
        decay={2}
      />
      <directionalLight
        ref={rimRef}
        position={[5, 2, -5]}
        intensity={0.65}
        color={scene.rimLight}
      />
      <pointLight position={[0, -3, 3]} intensity={0.25} color={scene.fillLight} decay={2} />
      {/* Back-rim specular — separates scoop from background with a cool edge */}
      <directionalLight position={[3, 1, -4]} intensity={0.45} color="#B8D4FF" />
    </>
  );
}

// ─── 3D model that spring-animates in when scene changes ─────────────────────
function JourneyModel({
  scene,
  isMobile,
}: {
  scene: SceneDefinition;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(0);
  const prevId = useRef(scene.id);

  // On scene change: snap scale to 0, then animate in
  useEffect(() => {
    if (prevId.current !== scene.id) {
      prevId.current = scene.id;
      if (groupRef.current) groupRef.current.scale.setScalar(0);
      animProgress.current = 0;
    }
  }, [scene.id]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (animProgress.current < 1) {
      animProgress.current = Math.min(1, animProgress.current + delta * 1.4);
      groupRef.current.scale.setScalar(easeOutBack(animProgress.current) * scene.modelScale);
    }
    // Subtle idle rotation
    groupRef.current.rotation.y += delta * 0.25;
  });

  const item = getSceneItem(scene);
  const [ox, oy, oz] = scene.modelOffset;
  const assemblyId = item ? `journey-${scene.id}` : "journey-opening";
  const isCone = item ? CONE_CATS.has(item.category) : true;

  const proceduralFallback = (
    <Float speed={1.1} floatIntensity={0.55} rotationIntensity={0.2}>
      {item ? (
        isCone ? (
          <IceCreamCone
            color={item.color}
            accentColor={item.accentColor}
            scale={1.0}
            assemblyId={assemblyId}
            isMobile={isMobile}
            rotating={false}
            instantComplete
          />
        ) : (
          <SundaeGlass
            item={item}
            scale={1.0}
            assemblyId={assemblyId}
            isMobile={isMobile}
            rotating={false}
            instantComplete
          />
        )
      ) : (
        <IceCreamCone
          color="#F2AABB"
          accentColor="#C8A8D8"
          scale={1.0}
          assemblyId="journey-opening"
          isMobile={isMobile}
          rotating={false}
          instantComplete
        />
      )}
    </Float>
  );

  return (
    <group ref={groupRef} position={[ox, oy, oz]}>
      <GLBModel sceneId={scene.id} assemblyId={assemblyId} fallback={proceduralFallback} />
    </group>
  );
}

// ─── Inner scene ─────────────────────────────────────────────────────────────
function SceneContent({
  activeSceneIndex,
  isMobile,
}: {
  activeSceneIndex: number;
  isMobile: boolean;
}) {
  const scene = SCENES[activeSceneIndex] ?? SCENES[0];

  return (
    <>
      <CameraController fov={scene.cameraFov} />
      <FogController scene={scene} />
      <SceneLights scene={scene} />

      <SceneParticles
        colors={scene.particleColors}
        count={isMobile ? Math.floor(scene.particleCount * 0.5) : scene.particleCount}
        type={scene.particleType}
        speed={scene.particleSpeed}
        size={scene.particleSize}
      />

      <JourneyModel scene={scene} isMobile={isMobile} />

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.35}
        scale={8}
        blur={3}
        far={5}
        color="#000000"
        frames={1}
      />

      <Environment preset="night" />

      {!isMobile && (
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.88}
            radius={0.8}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.1} darkness={0.75} />
        </EffectComposer>
      )}
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function JourneyCanvas({
  activeSceneIndex,
  isMobile,
}: {
  activeSceneIndex: number;
  isMobile: boolean;
}) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0.5, 5.5], fov: 46 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: !isMobile,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
        failIfMajorPerformanceCaveat: false,
      }}
      shadows={!isMobile}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <SceneContent activeSceneIndex={activeSceneIndex} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
}
