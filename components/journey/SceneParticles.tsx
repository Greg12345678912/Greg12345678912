"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ParticleType } from "@/lib/scenes";

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  phase: number;
  life: number;
  maxLife: number;
  size: number;
  colorIdx: number;
  angle: number;
  angleVel: number;
  scaleX: number; // for elongated shapes
}

function initParticles(
  count: number,
  type: ParticleType,
  speed: number,
  size: number
): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const phase = (i / count) * Math.PI * 2;
    const maxLife = 4 + Math.random() * 6;
    return {
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 5
      ),
      vel: getVel(type, speed),
      phase,
      life: Math.random() * maxLife,
      maxLife,
      size: size * (0.6 + Math.random() * 0.8),
      colorIdx: i % 5,
      angle: Math.random() * Math.PI * 2,
      angleVel: (Math.random() - 0.5) * 0.5,
      scaleX: type === "steam" ? 0.25 + Math.random() * 0.25 : 1,
    };
  });
}

function getVel(type: ParticleType, speed: number): THREE.Vector3 {
  switch (type) {
    case "steam":
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.003,
        speed * 0.012 + Math.random() * 0.008,
        (Math.random() - 0.5) * 0.002
      );
    case "mango":
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.3) * speed * 0.008, // mostly upward drift
        (Math.random() - 0.5) * 0.003
      );
    case "cloud":
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.0015,
        (Math.random() - 0.5) * 0.001
      );
    case "petal":
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        -(speed * 0.006 + Math.random() * 0.004), // fall downward
        (Math.random() - 0.5) * 0.002
      );
    case "energy":
      return new THREE.Vector3(
        (Math.random() - 0.5) * speed * 0.018,
        (Math.random() - 0.5) * speed * 0.018,
        (Math.random() - 0.5) * speed * 0.012
      );
    case "condensation":
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        -(speed * 0.006 + Math.random() * 0.003),
        (Math.random() - 0.5) * 0.001
      );
    default:
      return new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.003
      );
  }
}

function respawnParticle(p: Particle, type: ParticleType, speed: number) {
  p.life = 0;
  p.vel = getVel(type, speed);
  switch (type) {
    case "steam":
      p.pos.set(
        (Math.random() - 0.5) * 3,
        -4 - Math.random() * 2,
        (Math.random() - 0.5) * 2
      );
      break;
    case "petal":
      p.pos.set(
        (Math.random() - 0.5) * 14,
        5 + Math.random() * 3,
        (Math.random() - 0.5) * 5
      );
      break;
    case "condensation":
      p.pos.set(
        (Math.random() - 0.5) * 14,
        5 + Math.random() * 3,
        (Math.random() - 0.5) * 5
      );
      break;
    default:
      p.pos.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 5
      );
  }
}

interface SceneParticlesProps {
  colors: string[];
  count: number;
  type: ParticleType;
  speed: number;
  size: number;
}

export function SceneParticles({ colors, count, type, speed, size }: SceneParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);

  const colorObjects = useMemo(
    () => colors.slice(0, 5).map((c) => new THREE.Color(c)),
    [colors]
  );

  const particles = useMemo(
    () => initParticles(count, type, speed, size),
    [count, type, speed, size]
  );

  const isCloud = type === "cloud";
  const isPetal = type === "petal";
  const isSteam = type === "steam";
  const isCondensation = type === "condensation";

  // Geometry per type
  const geometry = useMemo(() => {
    if (isCloud) return new THREE.IcosahedronGeometry(1, 1);
    if (isPetal) return new THREE.CylinderGeometry(1, 0.6, 0.12, 6);
    if (isSteam) return new THREE.SphereGeometry(1, 5, 5);
    return new THREE.SphereGeometry(1, 5, 5);
  }, [isCloud, isPetal, isSteam]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05); // cap delta

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const mesh = child as THREE.Mesh;

      p.life += dt;
      if (p.life > p.maxLife) {
        respawnParticle(p, type, speed);
      }

      // Advance position
      const t = Date.now() * 0.001;
      if (type === "steam") {
        p.pos.x += Math.sin(t * 0.8 + p.phase) * 0.002;
        p.pos.y += p.vel.y;
        // Fade as it rises
        const opacity = 1 - (p.pos.y + 4) / 12;
        (mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, Math.min(0.6, opacity));
      } else if (type === "cloud") {
        p.pos.x += Math.sin(t * 0.2 + p.phase) * 0.002 + p.vel.x;
        p.pos.y += Math.cos(t * 0.15 + p.phase * 0.7) * 0.0015 + p.vel.y;
        p.pos.z += p.vel.z;
      } else if (type === "petal") {
        p.angle += p.angleVel * dt;
        p.pos.x += Math.sin(p.angle * 0.5) * 0.003 + p.vel.x;
        p.pos.y += p.vel.y;
        p.pos.z += p.vel.z;
      } else if (type === "condensation") {
        p.pos.x += Math.sin(t * 0.2 + p.phase) * 0.001 + p.vel.x;
        p.pos.y += p.vel.y;
        p.pos.z += p.vel.z;
      } else {
        p.pos.x += p.vel.x + Math.sin(t * 0.4 + p.phase) * 0.002;
        p.pos.y += p.vel.y + Math.cos(t * 0.35 + p.phase) * 0.0015;
        p.pos.z += p.vel.z;
      }

      // Wrap bounds
      if (p.pos.y > 6) p.pos.y = -6;
      if (p.pos.y < -6) p.pos.y = 6;
      if (Math.abs(p.pos.x) > 8) p.vel.x *= -1;
      if (Math.abs(p.pos.z) > 4) p.vel.z *= -1;

      // Apply transform
      mesh.position.copy(p.pos);
      mesh.scale.set(
        p.size * p.scaleX,
        p.size,
        p.size
      );

      if (isPetal) {
        mesh.rotation.set(Math.PI / 2, p.angle, 0);
      } else {
        mesh.rotation.y += dt * 0.3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} geometry={geometry} position={p.pos.toArray()}>
          {isCloud ? (
            <meshStandardMaterial
              color={colorObjects[p.colorIdx % colorObjects.length]}
              transparent
              opacity={0.18}
              roughness={1}
              metalness={0}
              side={THREE.DoubleSide}
            />
          ) : isSteam ? (
            <meshStandardMaterial
              color={colorObjects[p.colorIdx % colorObjects.length]}
              transparent
              opacity={0.45}
              roughness={1}
              depthWrite={false}
            />
          ) : isCondensation ? (
            <meshStandardMaterial
              color={colorObjects[p.colorIdx % colorObjects.length]}
              transparent
              opacity={0.38}
              roughness={0.05}
              metalness={0.35}
              depthWrite={false}
            />
          ) : (
            <meshStandardMaterial
              color={colorObjects[p.colorIdx % colorObjects.length]}
              roughness={0.3}
              metalness={0.1}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}
