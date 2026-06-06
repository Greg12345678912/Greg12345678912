"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { BUILDER_FLAVORS, BUILDER_BASES } from "@/lib/builderData";
import type { BaseId } from "@/lib/builderData";
import type { MenuItem } from "@/store/useStore";

// Dynamic import — no SSR for WebGL canvas
const BuilderCanvas = dynamic(
  () => import("@/components/three/BuilderCanvas").then((m) => m.BuilderCanvas),
  { ssr: false, loading: () => <div className="w-full h-full bg-blueboy-dark" /> }
);

// ─── Swipe hint labels ────────────────────────────────────────────────────────

function ScoopHint({ visible }: { visible: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      <span className="text-cream/40 text-xs uppercase tracking-[0.35em] px-4 py-2 rounded-full border border-cream/10 bg-blueboy-dark/30 backdrop-blur-sm select-none">
        ← Saveur →
      </span>
    </div>
  );
}

function BaseHint({ visible }: { visible: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      <span className="text-cream/40 text-xs uppercase tracking-[0.35em] px-4 py-2 rounded-full border border-cream/10 bg-blueboy-dark/30 backdrop-blur-sm select-none">
        ← Base →
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MenuBuilderSection() {
  const [flavorIdx, setFlavorIdx] = useState(0);
  const [baseIdx, setBaseIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isScoopHovered, setIsScoopHovered] = useState(false);
  const [isBaseHovered, setIsBaseHovered] = useState(false);

  // Refs for GSAP animations
  const nameRef = useRef<HTMLHeadingElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  // Swipe tracking
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const total = BUILDER_FLAVORS.length;
  const current: MenuItem = BUILDER_FLAVORS[flavorIdx] ?? BUILDER_FLAVORS[0]!;
  const currentBase = BUILDER_BASES[baseIdx] ?? BUILDER_BASES[0]!;

  // ── Mobile detection ──────────────────────────────────────────────────────

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Mobile blob float animations ──────────────────────────────────────────

  useEffect(() => {
    if (!isMobile) return;
    const ctx = gsap.context(() => {
      if (blob1Ref.current) {
        gsap.to(blob1Ref.current, {
          x: 25,
          y: -18,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (blob2Ref.current) {
        gsap.to(blob2Ref.current, {
          x: -20,
          y: 22,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.9,
        });
      }
    });
    return () => ctx.revert();
  }, [isMobile]);

  // ── Navigate flavors (GSAP slide) ─────────────────────────────────────────

  const navigate = useCallback(
    (dir: "next" | "prev") => {
      const xOut = dir === "next" ? -60 : 60;
      const xIn = dir === "next" ? 60 : -60;

      const targets = [nameRef.current, priceRef.current, descRef.current].filter(Boolean);

      if (targets.length === 0) {
        // No refs ready yet — just update index
        setFlavorIdx((i) => {
          if (dir === "next") return (i + 1) % total;
          return (i - 1 + total) % total;
        });
        return;
      }

      // Slide out
      gsap.to(targets, {
        x: xOut,
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          setFlavorIdx((i) => {
            const next = dir === "next" ? (i + 1) % total : (i - 1 + total) % total;
            return next;
          });

          // Reset position, slide back in
          requestAnimationFrame(() => {
            gsap.fromTo(
              targets,
              { x: -xIn, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" }
            );
          });
        },
      });
    },
    [total]
  );

  // ── Mobile blob color animation on flavor change ──────────────────────────

  useEffect(() => {
    if (!isMobile) return;
    if (blob1Ref.current) {
      gsap.to(blob1Ref.current, {
        background: `radial-gradient(circle, ${current.color}aa 0%, transparent 70%)`,
        duration: 0.8,
        ease: "power2.out",
      });
    }
    if (blob2Ref.current) {
      gsap.to(blob2Ref.current, {
        background: `radial-gradient(circle, ${current.accentColor}88 0%, transparent 70%)`,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  }, [flavorIdx, isMobile, current.color, current.accentColor]);

  // ── Pointer swipe handlers ────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    swipeStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const makeScoopPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!swipeStart.current) return;
      const dx = e.clientX - swipeStart.current.x;
      const dy = e.clientY - swipeStart.current.y;
      swipeStart.current = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
        navigate(dx < 0 ? "next" : "prev");
      }
    },
    [navigate]
  );

  const makeBasePointerUp = useCallback((e: React.PointerEvent) => {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    swipeStart.current = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      setBaseIdx((i) => (i + 1) % BUILDER_BASES.length);
    }
  }, []);

  // ── Flavor chips shared helper ────────────────────────────────────────────

  const renderFlavorChips = (item: MenuItem) =>
    item.flavorProfile.map((flavor) => (
      <span
        key={flavor}
        className="text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wide"
        style={{ borderColor: `${item.color}50`, color: `${item.color}cc` }}
      >
        {flavor}
      </span>
    ));

  // ── Render ────────────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <section id="menu" className="relative bg-blueboy-dark min-h-screen">
        {/* ── Mobile Hero — swipe zone ── */}
        <div
          style={{ height: "52vh", cursor: "ew-resize" }}
          className="relative overflow-hidden bg-blueboy-dark"
          onPointerDown={handlePointerDown}
          onPointerUp={makeScoopPointerUp}
        >
          {/* Blob 1 */}
          <div
            ref={blob1Ref}
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${current.color}aa 0%, transparent 70%)`,
              top: -80,
              left: -60,
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          {/* Blob 2 */}
          <div
            ref={blob2Ref}
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${current.accentColor}88 0%, transparent 70%)`,
              bottom: -60,
              right: -40,
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
            {/* Dot counter */}
            <div className="flex items-center gap-2 mb-4">
              {BUILDER_FLAVORS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFlavorIdx(i)}
                  aria-label={`Saveur ${i + 1}`}
                  style={{
                    width: i === flavorIdx ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === flavorIdx ? current.color : "rgba(255,248,240,0.25)",
                    transition: "all 0.3s ease",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* Giant gradient name */}
            <h2
              ref={nameRef}
              style={{
                fontFamily: "Playfair Display, serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(3rem, 15vw, 5.5rem)",
                background: `linear-gradient(135deg, ${current.color} 0%, ${current.accentColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 0.9,
              }}
            >
              {current.nameFr}
            </h2>

            {/* Price + rule */}
            <div ref={priceRef} className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-cream">
                ${current.price.toFixed(2)}
              </span>
              <div
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(to right, ${current.color}, transparent)`,
                }}
              />
            </div>

            {/* Swipe hint */}
            <p className="text-cream/25 text-[10px] uppercase tracking-[0.3em] mt-3 select-none">
              ← Glisser pour changer →
            </p>
          </div>
        </div>

        {/* ── Mobile Info section ── */}
        <div className="px-6 pt-6 pb-10">
          {/* Base selector */}
          <div className="flex gap-2 mb-6">
            {BUILDER_BASES.map((base, i) => (
              <button
                key={base.id}
                onClick={() => setBaseIdx(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  i === baseIdx
                    ? "bg-cream text-blueboy-dark font-semibold"
                    : "glass text-cream/60 hover:text-cream"
                }`}
              >
                {base.labelFr}
              </button>
            ))}
          </div>

          {/* Description */}
          <p
            ref={descRef}
            className="text-cream/60 text-sm leading-relaxed mb-5"
          >
            {current.description}
          </p>

          {/* Flavor chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {renderFlavorChips(current)}
          </div>

          {/* CTA */}
          <a
            href="https://le-blueboy-artisan-glacier.wheree.com/menu"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.18em] text-blueboy-dark"
            style={{ background: current.color }}
          >
            Commander Maintenant
          </a>
        </div>
      </section>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  return (
    <section
      id="menu"
      style={{ height: "100vh" }}
      className="relative bg-blueboy-dark flex overflow-hidden"
    >
      {/* ── Left: 3D canvas ── */}
      <div className="relative" style={{ width: "58%", height: "100%" }}>
        <BuilderCanvas
          flavorItem={current}
          baseId={currentBase.id as BaseId}
          isMobile={false}
        />

        {/* Scoop swipe zone — top 58% */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "58%",
            cursor: "ew-resize",
            zIndex: 10,
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={makeScoopPointerUp}
          onMouseEnter={() => setIsScoopHovered(true)}
          onMouseLeave={() => setIsScoopHovered(false)}
        >
          <ScoopHint visible={isScoopHovered} />
        </div>

        {/* Base swipe zone — bottom 42% */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "42%",
            cursor: "ew-resize",
            zIndex: 10,
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={makeBasePointerUp}
          onMouseEnter={() => setIsBaseHovered(true)}
          onMouseLeave={() => setIsBaseHovered(false)}
        >
          <BaseHint visible={isBaseHovered} />
        </div>
      </div>

      {/* ── Right: Info panel ── */}
      <div
        style={{ width: "42%" }}
        className="flex flex-col justify-center px-12 py-12 relative z-20"
      >
        {/* Section label */}
        <p className="text-blueboy-teal text-xs uppercase tracking-[0.35em] mb-8 select-none">
          Notre Menu
        </p>

        {/* Flavor counter + arrows */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("prev")}
            aria-label="Saveur précédente"
            className="w-10 h-10 rounded-full flex items-center justify-center glass text-cream/60 hover:text-cream transition-colors"
          >
            ←
          </button>
          <span className="text-cream/40 text-sm tabular-nums">
            {flavorIdx + 1} / {total}
          </span>
          <button
            onClick={() => navigate("next")}
            aria-label="Saveur suivante"
            className="w-10 h-10 rounded-full flex items-center justify-center glass text-cream/60 hover:text-cream transition-colors"
          >
            →
          </button>
        </div>

        {/* Item name — GSAP animated */}
        <div className="overflow-hidden mb-2">
          <h2
            ref={nameRef}
            style={{
              fontFamily: "Playfair Display, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 4.5vw, 5rem)",
              lineHeight: 1.0,
              background: `linear-gradient(135deg, ${current.color} 0%, ${current.accentColor} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {current.nameFr}
          </h2>
        </div>

        {/* Price */}
        <div ref={priceRef} className="mb-5">
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color: current.color }}
          >
            ${current.price.toFixed(2)}
          </span>
        </div>

        {/* Description */}
        <p
          ref={descRef}
          className="text-cream/55 text-sm leading-relaxed mb-6 max-w-sm"
        >
          {current.description}
        </p>

        {/* Flavor chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {renderFlavorChips(current)}
        </div>

        {/* Base selector */}
        <div className="flex gap-3 mb-8">
          {BUILDER_BASES.map((base, i) => (
            <button
              key={base.id}
              onClick={() => setBaseIdx(i)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                i === baseIdx
                  ? "bg-cream text-blueboy-dark font-semibold scale-105"
                  : "glass text-cream/60 hover:text-cream hover:border-cream/20"
              }`}
              style={i === baseIdx ? { boxShadow: `0 0 18px ${current.color}40` } : {}}
            >
              {base.labelFr}
            </button>
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://le-blueboy-artisan-glacier.wheree.com/menu"
          target="_blank"
          rel="noopener noreferrer"
          className="block py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.18em] text-blueboy-dark transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: current.color }}
        >
          Commander Maintenant →
        </a>
      </div>

      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-[0.06] rounded-full blur-3xl transition-colors duration-700"
        style={{ background: current.color }}
      />
    </section>
  );
}
