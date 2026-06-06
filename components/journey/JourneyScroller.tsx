"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { SCENES } from "@/lib/scenes";
import { useDevice } from "@/lib/useDevice";
import { useStore } from "@/store/useStore";
import { useSceneAmbient } from "@/lib/useSceneAmbient";

gsap.registerPlugin(ScrollTrigger);

const JourneyCanvas = dynamic(
  () => import("./JourneyCanvas").then((m) => m.JourneyCanvas),
  { ssr: false }
);

// ─── Scene text overlay ───────────────────────────────────────────────────────
function SceneText({ scene }: { scene: (typeof SCENES)[0] }) {
  const isRight = scene.textAlign === "right";
  const isCenter = scene.textAlign === "center";
  const isOpening = scene.id === "opening";

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10 pointer-events-none ${
        isRight ? "items-end text-right" : isCenter ? "items-center text-center" : "items-start text-left"
      }`}
      style={{ maxWidth: isCenter ? "100%" : undefined }}
    >
      {/* Left/right — content is half-width to leave room for 3D model */}
      <div className={`${isCenter ? "max-w-2xl" : "max-w-lg"}`}>
        {/* Eyebrow */}
        <p
          className="text-xs uppercase tracking-[0.38em] mb-5 font-medium"
          style={{ color: scene.eyebrowColor }}
        >
          {scene.eyebrow}
        </p>

        {/* Headline */}
        <div className="mb-6">
          {scene.headline.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <h2
                className="block leading-[0.9] font-bold tracking-tight"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontStyle: i === 0 && isOpening ? "normal" : i % 2 === 1 ? "italic" : "normal",
                  fontSize: "clamp(3.5rem, 8vw, 7.5rem)",
                  color: i === 0 ? scene.accentColor : scene.textColor,
                }}
              >
                {line}
              </h2>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="mb-6 h-px w-24"
          style={{
            background: `linear-gradient(90deg, ${scene.accentColor}, transparent)`,
            marginLeft: isRight ? "auto" : 0,
            marginRight: isRight ? 0 : "auto",
          }}
        />

        {/* Body */}
        <p
          className="text-sm md:text-base leading-relaxed font-light max-w-xs md:max-w-sm"
          style={{ color: `${scene.textColor}aa` }}
        >
          {scene.body}
        </p>

        {/* Opening CTA */}
        {isOpening && (
          <div className="mt-10 flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full animate-bounce"
              style={{ background: scene.accentColor, opacity: 0.8 }}
            />
            <span
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: `${scene.textColor}60` }}
            >
              Faites défiler
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scene progress dots ───────────────────────────────────────────────────────
function SceneDots({
  active,
  total,
  colors,
}: {
  active: number;
  total: number;
  colors: string[];
}) {
  return (
    <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 pointer-events-none">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === active ? 8 : 5,
            height: i === active ? 8 : 5,
            background: i === active ? colors[active] : "rgba(255,248,240,0.2)",
            boxShadow: i === active ? `0 0 12px ${colors[active]}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Scene ambient sound ───────────────────────────────────────────────────────
function SceneAmbient({ sceneIndex }: { sceneIndex: number }) {
  useSceneAmbient(sceneIndex);
  return null;
}

// ─── Main scroller ────────────────────────────────────────────────────────────
export function JourneyScroller() {
  const containerRef = useRef<HTMLElement>(null);
  const textLayersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeScene, setActiveScene] = useState(0);
  const { isMobile } = useDevice();

  const sceneColors = SCENES.map((s) => s.accentColor);

  const activateScene = useCallback((index: number) => {
    setActiveScene(index);

    // Animate new scene text in
    const newEl = textLayersRef.current[index];
    if (newEl) {
      gsap.fromTo(
        newEl,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
      );
    }
  }, []);

  const deactivateScene = useCallback((index: number) => {
    const el = textLayersRef.current[index];
    if (el) {
      gsap.to(el, { opacity: 0, y: -35, duration: 0.4, ease: "power2.in" });
    }
  }, []);

  const deactivateSceneBack = useCallback((index: number) => {
    const el = textLayersRef.current[index];
    if (el) {
      gsap.to(el, { opacity: 0, y: 35, duration: 0.4, ease: "power2.in" });
    }
  }, []);

  const activateSceneBack = useCallback(
    (index: number) => {
      setActiveScene(index);
      const el = textLayersRef.current[index];
      if (el) {
        gsap.fromTo(
          el,
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
        );
      }
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      SCENES.forEach((_, i) => {
        const startPct = (i / SCENES.length) * 100;
        const endPct = ((i + 1) / SCENES.length) * 100;

        ScrollTrigger.create({
          trigger: container,
          start: `${startPct}% top`,
          end: `${endPct}% top`,
          onEnter: () => activateScene(i),
          onLeave: () => deactivateScene(i),
          onEnterBack: () => activateSceneBack(i),
          onLeaveBack: () => deactivateSceneBack(i),
        });
      });
    });

    return () => ctx.revert();
  }, [activateScene, deactivateScene, activateSceneBack, deactivateSceneBack]);

  const activeSceneData = SCENES[activeScene] ?? SCENES[0];

  return (
    <section
      ref={containerRef}
      id="journey"
      style={{ height: `${SCENES.length * 100}vh`, position: "relative" }}
    >
      {/* Sticky viewport — holds canvas + all text layers */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Background gradient (CSS, behind canvas) */}
        <div
          className="absolute inset-0 z-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse at 30% 60%, ${activeSceneData.fillLight}18, transparent 60%),
                         linear-gradient(135deg, ${activeSceneData.bgFrom} 0%, ${activeSceneData.bgTo} 100%)`,
          }}
        />

        {/* R3F Canvas */}
        <div className="absolute inset-0 z-0">
          <JourneyCanvas activeSceneIndex={activeScene} isMobile={isMobile} />
        </div>

        {/* Ambient sound driver */}
        <SceneAmbient sceneIndex={activeScene} />

        {/* Scene text layers (stacked, only active one is visible) */}
        {SCENES.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => { textLayersRef.current[i] = el; }}
            className="absolute inset-0 z-10"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <SceneText scene={scene} />
          </div>
        ))}

        {/* Navigation dots */}
        <SceneDots
          active={activeScene}
          total={SCENES.length}
          colors={sceneColors}
        />

        {/* Scene name pill — bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div
            className="px-4 py-2 rounded-full text-xs uppercase tracking-[0.25em] backdrop-blur-sm transition-all duration-500"
            style={{
              background: `${activeSceneData.accentColor}18`,
              border: `1px solid ${activeSceneData.accentColor}30`,
              color: `${activeSceneData.textColor}80`,
            }}
          >
            {activeSceneData.id.replace(/-scene$/, "").replace(/-/g, " ")}
          </div>
        </div>
      </div>
    </section>
  );
}
