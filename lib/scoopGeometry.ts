import * as THREE from "three";

// ─── Hash-based value noise ───────────────────────────────────────────────────
// GLSL-style lattice hash — non-periodic, unlike the previous sin/cos products
// which repeated in a visible wave pattern across the scoop surface.

function hash(xi: number, yi: number, zi: number, seed: number): number {
  const s =
    Math.sin(xi * 127.1 + yi * 311.7 + zi * 74.7 + seed * 43.123) * 43758.5453;
  return s - Math.floor(s);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smooth value noise in [-1, 1] */
function valueNoise(x: number, y: number, z: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const w = smooth(z - zi);
  return (
    lerp(
      lerp(
        lerp(hash(xi, yi, zi, seed), hash(xi + 1, yi, zi, seed), u),
        lerp(hash(xi, yi + 1, zi, seed), hash(xi + 1, yi + 1, zi, seed), u),
        v
      ),
      lerp(
        lerp(hash(xi, yi, zi + 1, seed), hash(xi + 1, yi, zi + 1, seed), u),
        lerp(hash(xi, yi + 1, zi + 1, seed), hash(xi + 1, yi + 1, zi + 1, seed), u),
        v
      ),
      w
    ) *
      2 -
    1
  );
}

/** 3-octave fractal noise, unitless (~±0.095), scaled by radius at the call site */
function fbm(x: number, y: number, z: number, seed: number): number {
  return (
    valueNoise(x * 2.8, y * 2.8, z * 2.8, seed) * 0.055 +
    valueNoise(x * 6.5, y * 6.5, z * 6.5, seed + 7.3) * 0.028 +
    valueNoise(x * 14, y * 14, z * 14, seed + 19.1) * 0.012
  );
}

// ─── Scoop ────────────────────────────────────────────────────────────────────

/**
 * Displaced sphere that reads as a scooped ball of ice cream:
 * - fractal churn noise (rougher crest near the top pole where the scooper releases)
 * - one spiral drag ridge from the scooper blade
 * - low-order asymmetry so the silhouette isn't a circle
 * - oblate squash and a flattened seated contact patch at the bottom
 */
export function makeScoopGeometry(
  radius: number,
  seed: number,
  segs: number
): THREE.SphereGeometry {
  const geo = new THREE.SphereGeometry(radius, segs, segs);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) continue;

    const phi = Math.acos(Math.min(1, Math.max(-1, y / len)));
    const theta = Math.atan2(z, x);

    // Churn noise, amplified into a rough crest near the top pole
    const crest = 1 + Math.max(0, 0.7 - phi) * 1.6;
    let d = fbm(x / radius, y / radius, z / radius, seed) * radius * crest;

    // Spiral drag ridge with a slight groove beside it; fades at the poles
    const band = Math.sin(theta + phi * 2.6 + seed * 2.1);
    const fade = Math.sin(phi);
    d +=
      (Math.max(0, band) ** 5 - 0.4 * Math.max(0, -band) ** 5) *
      0.05 *
      radius *
      fade;

    // Low-order asymmetry
    d += Math.sin(theta * 2 + seed) * Math.sin(phi) ** 2 * 0.03 * radius;

    const f = Math.max(0.5, 1 + d / len);
    x *= f;
    y *= f;
    z *= f;

    // Oblate squash + seated contact patch
    y *= 0.94;
    const flatY = -0.66 * radius;
    if (y < flatY) y = flatY + (y - flatY) * 0.4;

    pos.setXYZ(i, x, y, z);
  }

  geo.rotateY(seed * 1.7);
  geo.computeVertexNormals();
  return geo;
}

// ─── Melt skirt ───────────────────────────────────────────────────────────────

/**
 * Lobed collar of melted ice cream that sags over a rim (cone edge, glass rim,
 * scoop junction). Starts as a shallow dome inside the rim, bulges over it,
 * and drips downward unevenly.
 */
export function makeMeltSkirtGeometry(
  radius: number,
  depth: number,
  seed: number,
  segs: number
): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(radius * 0.15, 0.3),
    new THREE.Vector2(radius * 0.55, 0.2),
    new THREE.Vector2(radius * 0.88, 0.06),
    new THREE.Vector2(radius * 1.05, -0.03),
    new THREE.Vector2(radius * 1.09, -depth * 0.35),
    new THREE.Vector2(radius * 1.02, -depth * 0.7),
    new THREE.Vector2(radius * 0.9, -depth),
  ];
  const geo = new THREE.LatheGeometry(pts, segs);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const theta = Math.atan2(z, x);
    // 0 at the dome top, 1 at the dripping bottom edge
    const sagT = Math.min(1, Math.max(0, -y / depth));
    const lobe =
      1 +
      (Math.sin(theta * 3 + seed) * 0.09 + Math.sin(theta * 5 + seed * 2.7) * 0.05) *
        sagT;
    const sag =
      sagT * sagT * Math.max(0, Math.sin(theta * 4 + seed * 1.3)) * depth * 0.45;
    pos.setXYZ(i, x * lobe, y - sag, z * lobe);
  }

  geo.computeVertexNormals();
  return geo;
}
