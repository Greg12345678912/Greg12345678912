"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { SCENES } from "@/lib/scenes";
import { useDevice } from "@/lib/useDevice";
import { useSceneAmbient } from "@/lib/useSceneAmbient";
import { useStore } from "@/store/useStore";

gsap.registerPlugin(ScrollTrigger);

const JourneyCanvas = dynamic(
  () => import("./JourneyCanvas").then((m) => m.JourneyCanvas),
  { ssr: false }
);

// ─── Cinematic word reveal ────────────────────────────────────────────────────
interface SceneTextProps {
  scene: (typeof SCENES)[0];
  isActive: boolean;
  firstDelay?: number;
}

function SceneText({ scene, isActive, firstDelay = 0 }: SceneTextProps) {
  const isRight = scene.textAlign === "right";
  const isOpening = scene.id === "opening";

  // Refs to each word span
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sceneNumRef = useRef<HTMLDivElement>(null);
  const sceneIdx = SCENES.findIndex((s) => s.id === scene.id);
  const isFirstActivation = useRef(true);

  useEffect(() => {
    if (!isActive) return;
    wordRefs.current = wordRefs.current.filter(Boolean);

    const delay = isFirstActivation.current ? firstDelay : 0;
    isFirstActivation.current = false;

    const tl = gsap.timeline({ delay });

    // Scene number slides in
    if (sceneNumRef.current) {
      tl.fromTo(
        sceneNumRef.current,
        { x: isRight ? 30 : -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
        0
      );
    }

    // Eyebrow fades in
    if (eyebrowRef.current) {
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        0.1
      );
    }

    // Words reveal upward through invisible clip (the premium agency move)
    if (wordRefs.current.length > 0) {
      tl.fromTo(
        wordRefs.current,
        { y: "105%", opacity: 0, rotateX: -12 },
        {
          y: "0%",
          opacity: 1,
          rotateX: 0,
          duration: 0.75,
          stagger: 0.055,
          ease: "power4.out",
        },
        0.15
      );
    }

    // Divider scales in from left/right
    if (dividerRef.current) {
      tl.fromTo(
        dividerRef.current,
        { scaleX: 0, transformOrigin: isRight ? "right" : "left" },
        { scaleX: 1, duration: 0.6, ease: "power3.inOut" },
        0.5
      );
    }

    // Body text rises
    if (bodyRef.current) {
      tl.fromTo(
        bodyRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
        0.6
      );
    }

    // CTA on opening
    if (ctaRef.current) {
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        0.9
      );
    }
  }, [isActive, isRight, firstDelay]);

  // Build word list across all headline lines
  let globalWordIdx = 0;
  const headlineLines = scene.headline.map((line, lineIdx) => {
    const words = line.split(" ");
    const spans = words.map((word, wi) => {
      const idx = globalWordIdx++;
      return (
        // Outer div clips the upward slide
        <div
          key={`${lineIdx}-${wi}`}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            marginRight: wi < words.length - 1 ? "0.22em" : 0,
          }}
        >
          <span
            ref={(el) => {
              if (el) wordRefs.current[idx] = el;
            }}
            style={{
              display: "inline-block",
              color: lineIdx === 0 ? scene.accentColor : scene.textColor,
              fontStyle:
                lineIdx === 0 && isOpening
                  ? "normal"
                  : lineIdx % 2 === 1
                  ? "italic"
                  : "normal",
            }}
          >
            {word}
          </span>
        </div>
      );
    });
    return (
      <div key={lineIdx} style={{ display: "block", lineHeight: 0.92 }}>
        {spans}
      </div>
    );
  });

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 pointer-events-none ${
        isRight ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <div className="max-w-lg">
        {/* Scene number */}
        <div
          ref={sceneNumRef}
          className="flex items-center gap-3 mb-6 opacity-0"
          style={{ justifyContent: isRight ? "flex-end" : "flex-start" }}
        >
          <span className="text-[10px] font-mono tracking-[0.35em]" style={{ color: `${scene.textColor}35` }}>
            {String(sceneIdx + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
          </span>
          <div className="flex-1 h-px max-w-[40px]" style={{ background: `${scene.accentColor}30` }} />
          <span
            className="text-[9px] uppercase tracking-[0.32em] font-medium"
            style={{ color: scene.eyebrowColor }}
          >
            {scene.eyebrow}
          </span>
        </div>

        {/* Eyebrow hidden (merged into number row above) */}
        <p ref={eyebrowRef} className="hidden" />

        {/* Headline — word by word reveal */}
        <div
          className="mb-8"
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(3.2rem, 7.5vw, 7rem)",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            perspective: "900px",
            perspectiveOrigin: isRight ? "right center" : "left center",
          }}
        >
          {headlineLines}
        </div>

        {/* Divider */}
        <div
          ref={dividerRef}
          className="mb-6 h-px w-28"
          style={{
            background: `linear-gradient(${isRight ? "270deg" : "90deg"}, ${scene.accentColor}, transparent)`,
            marginLeft: isRight ? "auto" : 0,
          }}
        />

        {/* Body */}
        <p
          ref={bodyRef}
          className="text-sm md:text-base leading-[1.7] font-light opacity-0"
          style={{ color: `${scene.textColor}88`, maxWidth: "30ch" }}
        >
          {scene.body}
        </p>

        {/* Opening scroll hint */}
        {isOpening && (
          <div ref={ctaRef} className="mt-10 opacity-0 flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full animate-bounce"
                  style={{
                    background: scene.accentColor,
                    height: 20,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0.7 - i * 0.15,
                  }}
                />
              ))}
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.38em] font-medium"
              style={{ color: `${scene.textColor}50` }}
            >
              Faites défiler
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scene flash overlay ──────────────────────────────────────────────────────
function SceneFlash({ color }: { color: string }) {
  const flashRef = useRef<HTMLDivElement>(null);
  const prevColor = useRef(color);

  useEffect(() => {
    if (!flashRef.current || prevColor.current === color) return;
    prevColor.current = color;

    gsap.fromTo(
      flashRef.current,
      { opacity: 0.22 },
      { opacity: 0, duration: 0.55, ease: "power2.out" }
    );
  }, [color]);

  return (
    <div
      ref={flashRef}
      className="absolute inset-0 z-30 pointer-events-none opacity-0"
      style={{ background: color, mixBlendMode: "screen" }}
    />
  );
}

// ─── Navigation dots ─────────────────────────────────────────────────────────
function SceneDots({
  active,
  colors,
  onDotClick,
}: {
  active: number;
  colors: string[];
  onDotClick: (i: number) => void;
}) {
  return (
    <div className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5 pointer-events-auto">
      {colors.map((color, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Scene ${i + 1}`}
          className="relative flex items-center justify-center p-2 -m-2"
        >
          <div
            className="rounded-full transition-all duration-500"
            style={{
              width: i === active ? 7 : 4,
              height: i === active ? 7 : 4,
              background: i === active ? color : "rgba(255,248,240,0.18)",
              boxShadow: i === active ? `0 0 14px ${color}, 0 0 28px ${color}60` : "none",
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function SceneProgress({ active, total, color }: { active: number; total: number; color: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-white/5 pointer-events-none">
      <div
        className="h-full transition-all duration-700 ease-out"
        style={{
          width: `${((active + 1) / total) * 100}%`,
          background: `linear-gradient(90deg, ${color}60, ${color})`,
        }}
      />
    </div>
  );
}

// ─── Ambient driver ───────────────────────────────────────────────────────────
function SceneAmbient({ sceneIndex }: { sceneIndex: number }) {
  useSceneAmbient(sceneIndex);
  return null;
}

// ─── End-of-journey CTA ───────────────────────────────────────────────────────
function JourneyCTA({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 20,
      duration: 0.8,
      ease: "power3.out",
    });
  }, [visible]);

  return (
    <div
      ref={ref}
      className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-auto opacity-0"
    >
      <button
        onClick={() =>
          document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
        }
        className="group flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all duration-300 text-xs uppercase tracking-[0.28em]"
      >
        <span>Voir le menu complet</span>
        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
      </button>
    </div>
  );
}

// ─── Main scroller ────────────────────────────────────────────────────────────
export function JourneyScroller() {
  const containerRef = useRef<HTMLElement>(null);
  const textLayersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeScene, setActiveScene] = useState(0);
  const [activeSceneId, setActiveSceneId] = useState(SCENES[0].id);
  const [showCTA, setShowCTA] = useState(false);
  const { isMobile } = useDevice();

  const activeSceneData = SCENES[activeScene] ?? SCENES[0];
  const { setSceneAccentColor } = useStore();

  const hideLayer = (i: number, dir: "up" | "down") => {
    const el = textLayersRef.current[i];
    if (el) gsap.to(el, { opacity: 0, y: dir === "up" ? -40 : 40, duration: 0.35, ease: "power2.in" });
  };

  const showLayer = (i: number, dir: "up" | "down") => {
    const el = textLayersRef.current[i];
    if (el) {
      gsap.set(el, { opacity: 0, y: dir === "up" ? 50 : -50 });
      gsap.to(el, { opacity: 1, y: 0, duration: 0.1, ease: "none" });
    }
  };

  const activateScene = useCallback((index: number, dir: "up" | "down" = "up") => {
    setActiveScene(index);
    setActiveSceneId(SCENES[index].id);
    setShowCTA(index === SCENES.length - 1);
    setSceneAccentColor(SCENES[index].accentColor);
    showLayer(index, dir);
  }, []);

  // Keyboard arrow navigation between scenes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const rect = container.getBoundingClientRect();
      // Only handle when the journey section is in the viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      e.preventDefault();
      const top = container.getBoundingClientRect().top + window.scrollY;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = Math.max(0, Math.min(SCENES.length - 1, activeScene + delta));
      const target = top + (next / SCENES.length) * container.offsetHeight + 1;
      window.scrollTo({ top: target, behavior: "smooth" });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeScene]);

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
          onEnter: () => {
            if (i > 0) hideLayer(i - 1, "up");
            activateScene(i, "up");
          },
          onLeave: () => {
            if (i === SCENES.length - 1) hideLayer(i, "up");
          },
          onEnterBack: () => {
            if (i < SCENES.length - 1) hideLayer(i + 1, "down");
            activateScene(i, "down");
          },
          onLeaveBack: () => {
            hideLayer(i, "down");
          },
        });
      });
    });

    return () => ctx.revert();
  }, [activateScene]);

  return (
    <section
      ref={containerRef}
      id="journey"
      style={{ height: `${SCENES.length * 100}vh`, position: "relative" }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* Fade to section below */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
          style={{
            height: 120,
            background: "linear-gradient(to bottom, transparent, #13131A)",
          }}
        />
        {/* CSS background */}
        <div
          className="absolute inset-0 z-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse at 35% 55%, ${activeSceneData.fillLight}15, transparent 55%),
                         linear-gradient(135deg, ${activeSceneData.bgFrom} 0%, ${activeSceneData.bgTo} 100%)`,
          }}
        />

        {/* R3F canvas */}
        <div className="absolute inset-0 z-0">
          <JourneyCanvas activeSceneIndex={activeScene} isMobile={isMobile} />
        </div>

        {/* Ambient */}

        {/* Scene flash on transition */}
        <SceneFlash color={activeSceneData.accentColor} />

        {/* Text layers — one per scene, GSAP controls visibility */}
        {SCENES.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => { textLayersRef.current[i] = el; }}
            className="absolute inset-0 z-10"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <SceneText
              scene={scene}
              isActive={i === activeScene && activeSceneId === scene.id}
              firstDelay={i === 0 ? 8.0 : 0}
            />
          </div>
        ))}


        {/* End-of-journey CTA */}
        <JourneyCTA visible={showCTA} />
      </div>
    </section>
  );
}
