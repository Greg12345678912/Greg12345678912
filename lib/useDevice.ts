"use client";

import { useState, useEffect } from "react";

export type DeviceTier = "phone" | "tablet" | "desktop";

export interface DeviceCapabilities {
  tier: DeviceTier;
  isMobile: boolean;        // true only for phones — backward compat
  transmission: boolean;    // MeshPhysicalMaterial transmission safe
  postProcessing: boolean;  // EffectComposer / Bloom safe
  shadows: boolean;
  particleDensity: number;  // 0–1 multiplier applied to per-scene particle count
  dpr: [number, number];
  antialias: boolean;
}

function detectTier(): DeviceTier {
  const width = window.innerWidth;
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports MacIntel user-agent with touch points
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && hasTouchPoints);

  if (width < 768) return "phone";
  if (isIOS) return "tablet";
  if (width < 1200 && hasTouchPoints) return "tablet";
  return "desktop";
}

const CAPS: Record<DeviceTier, Omit<DeviceCapabilities, "isMobile">> = {
  phone: {
    tier: "phone",
    transmission: false,
    postProcessing: false,
    shadows: false,
    particleDensity: 0.4,
    dpr: [1, 1.5],
    antialias: false,
  },
  tablet: {
    tier: "tablet",
    transmission: false,
    postProcessing: false,
    shadows: true,
    particleDensity: 0.6,
    dpr: [1, 2],
    antialias: true,
  },
  desktop: {
    tier: "desktop",
    transmission: true,
    postProcessing: true,
    shadows: true,
    particleDensity: 1.0,
    dpr: [1, 2],
    antialias: true,
  },
};

export function useDevice(): DeviceCapabilities {
  const [tier, setTier] = useState<DeviceTier>(() => {
    if (typeof window === "undefined") return "desktop";
    return detectTier();
  });

  useEffect(() => {
    const update = () => setTier(detectTier());
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return { ...CAPS[tier], isMobile: tier === "phone" };
}
