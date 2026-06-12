import { menuItems } from "./menuData";
import type { MenuItem } from "@/store/useStore";

export type ParticleType = "default" | "mango" | "cloud" | "steam" | "energy" | "petal" | "condensation";

export interface SceneDefinition {
  id: string;
  itemId: string | null;
  // Typography
  eyebrow: string;
  headline: string[];
  body: string;
  textAlign: "left" | "center" | "right";
  // Colors
  bgFrom: string;
  bgTo: string;
  fogColor: string;
  fogDensity: number;
  particleColors: string[];
  textColor: string;
  eyebrowColor: string;
  accentColor: string;
  // Lighting
  keyLight: string;
  keyIntensity: number;
  fillLight: string;
  rimLight: string;
  // Camera
  cameraFov: number;
  modelScale: number;
  modelOffset: [number, number, number];
  // Particles
  particleType: ParticleType;
  particleCount: number;
  particleSpeed: number;
  particleSize: number;
  // Audio
  droneHz: number;
  droneType: OscillatorType;
  droneGain: number;
}

export const SCENES: SceneDefinition[] = [
  // ── 0 · OPENING ──────────────────────────────────────────────────────
  {
    id: "opening",
    itemId: null,
    eyebrow: "Artisan Glacier · Montréal",
    headline: ["L'été.", "Le froid.", "Ce moment."],
    body: "Il fait chaud.",
    textAlign: "left",
    bgFrom: "#0D0800",
    bgTo: "#1A1200",
    fogColor: "#0C0800",
    fogDensity: 0.006,
    particleColors: ["#FFE8B0", "#FFF5DC", "#FFFAE0", "#FFB347", "#FFD580"],
    textColor: "#FFF5DC",
    eyebrowColor: "#FFB347",
    accentColor: "#FF8C00",
    keyLight: "#FFFBE0",
    keyIntensity: 2.4,
    fillLight: "#FFB347",
    rimLight: "#B8D4FF",
    cameraFov: 44,
    modelScale: 1.1,
    modelOffset: [0, 0, 0],
    particleType: "condensation",
    particleCount: 22,
    particleSpeed: 0.08,
    particleSize: 0.018,
    droneHz: 110,
    droneType: "sine",
    droneGain: 0.008,
  },

  // ── 1 · BLOODY MANGUE ────────────────────────────────────────────────
  {
    id: "bloody-mangue",
    itemId: "bloody-mangue",
    eyebrow: "Les Twists Signature",
    headline: ["Soleil.", "Mangue.", "Liberté."],
    body: "Sorbet mangue & melon d'eau fraise. Un coucher de soleil dans un cornet.",
    textAlign: "left",
    bgFrom: "#140800",
    bgTo: "#2E0E00",
    fogColor: "#1F0A00",
    fogDensity: 0.025,
    particleColors: ["#FF8C42", "#F4C430", "#FF6B35", "#FFB347", "#E85D04"],
    textColor: "#FFE0B2",
    eyebrowColor: "#F4C430",
    accentColor: "#FF8C42",
    keyLight: "#FF9A4A",
    keyIntensity: 2.2,
    fillLight: "#FF6B35",
    rimLight: "#F4C430",
    cameraFov: 48,
    modelScale: 1.2,
    modelOffset: [0.4, 0, 0],
    particleType: "mango",
    particleCount: 40,
    particleSpeed: 0.16,
    particleSize: 0.055,
    droneHz: 174,
    droneType: "sine",
    droneGain: 0.010,
  },

  // ── 2 · NUAGE VIOLET ─────────────────────────────────────────────────
  {
    id: "nuage-violet",
    itemId: "nuage-violet",
    eyebrow: "Les Twists Signature",
    headline: ["Rêver.", "Dériver.", "Disparaître."],
    body: "Vanille et taro en spirale. Un nuage qui fond sur la langue.",
    textAlign: "right",
    bgFrom: "#060010",
    bgTo: "#140028",
    fogColor: "#0A0018",
    fogDensity: 0.022,
    particleColors: ["#9B59B6", "#6C3483", "#BDC3F7", "#7B2FBE", "#C89BF4"],
    textColor: "#EDD5FF",
    eyebrowColor: "#C89BF4",
    accentColor: "#9B59B6",
    keyLight: "#C89BF4",
    keyIntensity: 1.6,
    fillLight: "#7B2FBE",
    rimLight: "#BDC3F7",
    cameraFov: 44,
    modelScale: 1.15,
    modelOffset: [-0.3, 0, 0],
    particleType: "cloud",
    particleCount: 28,
    particleSpeed: 0.08,
    particleSize: 0.18,
    droneHz: 528,
    droneType: "sine",
    droneGain: 0.012,
  },

  // ── 3 · AFFOGATO ─────────────────────────────────────────────────────
  {
    id: "affogato",
    itemId: "affogato",
    eyebrow: "Les Flotteurs",
    headline: ["L'instant", "parfait."],
    body: "Glace vanille. Espresso. Un mariage entre l'Italie et Montréal.",
    textAlign: "left",
    bgFrom: "#0D0600",
    bgTo: "#1E1100",
    fogColor: "#120800",
    fogDensity: 0.03,
    particleColors: ["#8B6914", "#C8941A", "#F4C430", "#6B4F00", "#E09A20"],
    textColor: "#FFE4A0",
    eyebrowColor: "#C8941A",
    accentColor: "#C8941A",
    keyLight: "#FFCC70",
    keyIntensity: 2.0,
    fillLight: "#C8941A",
    rimLight: "#8B6914",
    cameraFov: 46,
    modelScale: 1.1,
    modelOffset: [0.3, 0, 0],
    particleType: "steam",
    particleCount: 45,
    particleSpeed: 0.35,
    particleSize: 0.032,
    droneHz: 220,
    droneType: "sine",
    droneGain: 0.008,
  },

  // ── 4 · MANGONADA ────────────────────────────────────────────────────
  {
    id: "mangonada-scene",
    itemId: "mangonada",
    eyebrow: "Les Sundaes Signature",
    headline: ["Sucré.", "Piquant.", "Inoubliable."],
    body: "Chamoy, tajin, mangue. Une explosion qui ne ressemble à rien d'autre.",
    textAlign: "left",
    bgFrom: "#130008",
    bgTo: "#280010",
    fogColor: "#180008",
    fogDensity: 0.022,
    particleColors: ["#FF6B9D", "#FF8C42", "#CC0055", "#FF4488", "#FF9966"],
    textColor: "#FFD0E0",
    eyebrowColor: "#FF6B9D",
    accentColor: "#FF6B9D",
    keyLight: "#FF9966",
    keyIntensity: 2.1,
    fillLight: "#FF6B9D",
    rimLight: "#CC0055",
    cameraFov: 50,
    modelScale: 1.2,
    modelOffset: [-0.4, 0, 0],
    particleType: "energy",
    particleCount: 55,
    particleSpeed: 0.38,
    particleSize: 0.038,
    droneHz: 293,
    droneType: "sine",
    droneGain: 0.010,
  },

  // ── 5 · ISLA VIOLETTE ────────────────────────────────────────────────
  {
    id: "isla-violette-scene",
    itemId: "isla-violette",
    eyebrow: "Les Sundaes Signature",
    headline: ["Éphémère.", "Délectable.", "Le dernier."],
    body: "La saison passe. La saveur reste.",
    textAlign: "right",
    bgFrom: "#080010",
    bgTo: "#180028",
    fogColor: "#0C0018",
    fogDensity: 0.020,
    particleColors: ["#FF6B9D", "#C89BF4", "#E8B4D8", "#FF99CC", "#9B59B6"],
    textColor: "#FFD5EE",
    eyebrowColor: "#C89BF4",
    accentColor: "#FF6B9D",
    keyLight: "#E8B4D8",
    keyIntensity: 1.7,
    fillLight: "#FF6B9D",
    rimLight: "#9B59B6",
    cameraFov: 44,
    modelScale: 1.15,
    modelOffset: [0.3, 0, 0],
    particleType: "petal",
    particleCount: 48,
    particleSpeed: 0.12,
    particleSize: 0.06,
    droneHz: 396,
    droneType: "sine",
    droneGain: 0.009,
  },
];

export function getSceneItem(scene: SceneDefinition): MenuItem | null {
  if (!scene.itemId) return null;
  return menuItems.find((m) => m.id === scene.itemId) ?? null;
}
