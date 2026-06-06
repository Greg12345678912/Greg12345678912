import { menuItems } from "./menuData";
import type { MenuItem } from "@/store/useStore";

export type ParticleType = "default" | "mango" | "cloud" | "steam" | "energy" | "petal";

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
    headline: ["Une expérience", "glacée comme", "jamais vue."],
    body: "Faites défiler pour découvrir.",
    textAlign: "left",
    bgFrom: "#0A0A0F",
    bgTo: "#13131A",
    fogColor: "#0A0A0F",
    fogDensity: 0.018,
    particleColors: ["#FF6B9D", "#9B59B6", "#00C9B1", "#F4C430", "#FF8C42"],
    textColor: "#FFF8F0",
    eyebrowColor: "#00C9B1",
    accentColor: "#FF6B9D",
    keyLight: "#FFF8E8",
    keyIntensity: 1.8,
    fillLight: "#FF6B9D",
    rimLight: "#9B59B6",
    cameraFov: 44,
    modelScale: 1.1,
    modelOffset: [0, 0, 0],
    particleType: "default",
    particleCount: 55,
    particleSpeed: 0.22,
    particleSize: 0.045,
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
    headline: ["Floral.", "Délicat.", "Sublime."],
    body: "Taro, fraise, fleurs comestibles. La douceur à l'état pur.",
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
