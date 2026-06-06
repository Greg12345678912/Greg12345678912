"use client";

import { useEffect, useRef, Component, useState } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";
import type { MenuItem } from "@/store/useStore";

const ItemScene = dynamic(
  () => import("@/components/three/ItemScene").then((m) => m.ItemScene),
  { ssr: false }
);

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Blob + title entrance animation (mobile only)
  useEffect(() => {
    if (!isMobile) return;
    const blob1 = blob1Ref.current;
    const blob2 = blob2Ref.current;
    const title = titleRef.current;
    const price = priceRef.current;
    if (!blob1 || !blob2) return;

    // Idle float — blob1
    gsap.to(blob1, {
      x: 28, y: -18, duration: 4.2,
      repeat: -1, yoyo: true, ease: "sine.inOut",
    });
    // Idle float — blob2 (offset phase)
    gsap.to(blob2, {
      x: -22, y: 20, duration: 3.6,
      repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.9,
    });

    // Title slide-in
    if (title) {
      gsap.fromTo(title,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "power3.out", delay: 0.15 }
      );
    }
    if (price) {
      gsap.fromTo(price,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [isMobile]);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      .fromTo(
        panelRef.current,
        { y: isMobile ? "100%" : 60, opacity: isMobile ? 1 : 0, scale: isMobile ? 1 : 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" },
        "-=0.1"
      );

    const focusTimer = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 400);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [isMobile]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
        previousFocus.current?.focus();
      },
    });
    if (isMobile) {
      tl.to(panelRef.current, { y: "100%", duration: 0.35, ease: "power2.in" })
        .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.15");
    } else {
      tl.to(panelRef.current, { y: 40, opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" })
        .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.nameFr}
      className="fixed inset-0 z-[500] flex items-end md:items-center justify-center md:p-8"
      style={{ background: "rgba(10,10,15,0.88)", backdropFilter: "blur(20px)" }}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      <div
        ref={panelRef}
        className="relative w-full md:max-w-4xl bg-blueboy-mid md:rounded-3xl rounded-t-3xl overflow-hidden border border-cream/10 max-h-[92vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-cream/50 hover:text-cream transition-colors"
          style={{ background: "rgba(255,248,240,0.07)" }}
          aria-label="Fermer"
        >
          ✕
        </button>

        {isMobile ? (
          /* ── Mobile: typographic hero ── */
          <>
            {/* Hero header */}
            <div
              className="relative overflow-hidden"
              style={{ height: 240, background: "#0A0A0F" }}
            >
              {/* Animated blob 1 */}
              <div
                ref={blob1Ref}
                className="absolute pointer-events-none"
                style={{
                  width: 260, height: 260,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${item.color}55 0%, transparent 70%)`,
                  top: -60, left: -40,
                  filter: "blur(32px)",
                }}
              />
              {/* Animated blob 2 */}
              <div
                ref={blob2Ref}
                className="absolute pointer-events-none"
                style={{
                  width: 220, height: 220,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${item.accentColor}40 0%, transparent 70%)`,
                  bottom: -50, right: -20,
                  filter: "blur(28px)",
                }}
              />

              {/* Noise texture overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.035,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "200px 200px",
                }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end px-6 pb-5 pt-12">
                {/* Category */}
                <span
                  className="text-[10px] uppercase tracking-[0.32em] mb-3 self-start px-2.5 py-1 rounded-full"
                  style={{
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}35`,
                    color: `${item.color}dd`,
                  }}
                >
                  {item.category}
                </span>

                {/* Giant item name */}
                <h2
                  ref={titleRef}
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: "clamp(3rem, 14vw, 5rem)",
                    fontWeight: 700,
                    fontStyle: "italic",
                    lineHeight: 0.92,
                    letterSpacing: "-0.02em",
                    backgroundImage: `linear-gradient(135deg, ${item.color} 0%, ${item.accentColor} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    opacity: 0,
                  }}
                >
                  {item.nameFr}
                </h2>

                {/* Price */}
                <div ref={priceRef} className="mt-2 flex items-baseline gap-3" style={{ opacity: 0 }}>
                  <span
                    className="text-2xl font-bold text-cream"
                  >
                    ${item.price.toFixed(2)}
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ background: `linear-gradient(90deg, ${item.color}50, transparent)` }}
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-6 pt-6 pb-8">
              <p className="text-cream/60 text-sm leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Flavor chips */}
              <p className="text-cream/30 text-[10px] uppercase tracking-[0.22em] mb-3">
                Profil de saveur
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {item.flavorProfile.map((f, i) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: `${item.color}${i === 0 ? "25" : "12"}`,
                      color: item.color,
                      border: `1px solid ${item.color}28`,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <a
                  href="https://le-blueboy-artisan-glacier.wheree.com/menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.18em] text-blueboy-dark"
                  style={{ background: item.color }}
                >
                  Commander Maintenant
                </a>
                <button
                  onClick={handleClose}
                  className="block w-full py-3.5 rounded-full text-center text-sm uppercase tracking-[0.15em] text-cream/50 hover:text-cream transition-colors"
                  style={{ background: "rgba(255,248,240,0.04)", border: "1px solid rgba(255,248,240,0.08)" }}
                >
                  Retour au Menu
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ── Desktop: 3D canvas side-by-side ── */
          <div className="grid grid-cols-2 min-h-[500px]">
            <div
              className="relative"
              style={{ background: `radial-gradient(circle at 50% 50%, ${item.color}15, transparent 70%)` }}
            >
              <div className="absolute inset-0">
                <CanvasErrorBoundary>
                  <ItemScene item={item} />
                </CanvasErrorBoundary>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cream/30 text-xs flex items-center gap-2 pointer-events-none">
                <span>⟳</span>
                <span>Faites tourner</span>
              </div>
            </div>

            <div className="p-10 flex flex-col justify-between">
              <div>
                <span
                  className="inline-block text-xs uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 border"
                  style={{ borderColor: `${item.color}40`, color: `${item.color}cc` }}
                >
                  {item.category}
                </span>
                <h2
                  className="text-5xl font-bold text-cream leading-tight mb-2"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {item.nameFr}
                </h2>
                <div className="mb-6">
                  <span className="text-5xl font-bold" style={{ color: item.color }}>
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-cream/60 leading-relaxed mb-6 text-base">
                  {item.description}
                </p>
                <div className="mb-8">
                  <p className="text-cream/30 text-xs uppercase tracking-[0.2em] mb-3">
                    Profil de saveur
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.flavorProfile.map((f, i) => (
                      <span
                        key={f}
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          background: `${item.color}${i === 0 ? "30" : "15"}`,
                          color: item.color,
                          border: `1px solid ${item.color}30`,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <a
                  href="https://le-blueboy-artisan-glacier.wheree.com/menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.15em] text-blueboy-dark transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: item.color }}
                >
                  Commander Maintenant
                </a>
                <button
                  onClick={handleClose}
                  className="block w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.15em] text-cream/50 hover:text-cream transition-all duration-300"
                  style={{ background: "rgba(255,248,240,0.04)", border: "1px solid rgba(255,248,240,0.08)" }}
                >
                  Retour au Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
