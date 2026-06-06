"use client";

import { useEffect, useRef, useState, Component } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { easeOutBack } from "@/lib/easing";

// ─── Error boundary so a missing GLB silently falls back ─────────────────────
interface EBState { failed: boolean }
class GLBErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// ─── Actual GLTF loader ───────────────────────────────────────────────────────
function GLBMesh({ url, assemblyId }: { url: string; assemblyId: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef(0);
  const prevId = useRef(assemblyId);

  useEffect(() => {
    if (prevId.current !== assemblyId) {
      prevId.current = assemblyId;
      if (groupRef.current) groupRef.current.scale.setScalar(0);
      animRef.current = 0;
    }
  }, [assemblyId]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (animRef.current < 1) {
      animRef.current = Math.min(1, animRef.current + delta * 1.3);
      groupRef.current.scale.setScalar(easeOutBack(animRef.current));
    }
    groupRef.current.rotation.y += delta * 0.22;
  });

  // Clone the scene so multiple uses don't share the same THREE object
  const cloned = scene.clone(true);

  // Apply premium material overrides — keeps textures but improves quality
  cloned.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.envMapIntensity = 1.8;
          m.needsUpdate = true;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={cloned} />
    </group>
  );
}

// ─── Public component: tries GLB, falls back to children ─────────────────────
interface GLBModelProps {
  sceneId: string;       // matches /public/models/{sceneId}.glb
  assemblyId: string;
  fallback: ReactNode;
}

export function GLBModel({ sceneId, assemblyId, fallback }: GLBModelProps) {
  const url = `/models/${sceneId}.glb`;
  const [exists, setExists] = useState<boolean | null>(null);

  // Probe for the file without triggering a React error
  useEffect(() => {
    fetch(url, { method: "HEAD" })
      .then((r) => setExists(r.ok))
      .catch(() => setExists(false));
  }, [url]);

  if (exists === null || !exists) return <>{fallback}</>;

  return (
    <GLBErrorBoundary fallback={<>{fallback}</>}>
      <GLBMesh url={url} assemblyId={assemblyId} />
    </GLBErrorBoundary>
  );
}
