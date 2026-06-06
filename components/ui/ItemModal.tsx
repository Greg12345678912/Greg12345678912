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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 1);
  }, []);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .fromTo(
        panelRef.current,
        { y: 60, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
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
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
        previousFocus.current?.focus();
      },
    });
    tl.to(panelRef.current, { y: 40, opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }).to(
      overlayRef.current,
      { opacity: 0, duration: 0.2 },
      "-=0.1"
    );
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.nameFr}
      className="fixed inset-0 z-[500] flex items-end md:items-center justify-center md:p-8"
      style={{ background: "rgba(10, 10, 15, 0.85)", backdropFilter: "blur(20px)" }}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      <div
        ref={panelRef}
        className="relative w-full md:max-w-4xl bg-blueboy-mid md:rounded-3xl rounded-t-3xl overflow-hidden border border-cream/10 max-h-[92vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-cream/50 hover:text-cream transition-colors"
          style={{ background: "rgba(255,248,240,0.06)" }}
        >
          ✕
        </button>

        {isMobile ? (
          /* ── Mobile layout: color hero + stacked info ── */
          <>
            {/* Color hero panel */}
            <div
              className="relative flex flex-col items-start justify-end px-6 pb-6 pt-10"
              style={{
                minHeight: 180,
                background: `linear-gradient(145deg, ${item.color}28 0%, ${item.accentColor}18 60%, transparent 100%), linear-gradient(to bottom, #0D0D14, #13131A)`,
              }}
            >
              {/* Decorative glow orb */}
              <div
                className="absolute top-0 right-8 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${item.color}35 0%, transparent 70%)`,
                  transform: "translateY(-30%)",
                }}
              />

              {/* Category */}
              <span
                className="text-[10px] uppercase tracking-[0.3em] mb-3 px-3 py-1 rounded-full border"
                style={{ borderColor: `${item.color}40`, color: `${item.color}cc` }}
              >
                {item.category}
              </span>

              {/* Name + price inline */}
              <h2
                className="text-3xl font-bold text-cream leading-tight mb-1"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {item.nameFr}
              </h2>
              <span className="text-2xl font-bold" style={{ color: item.color }}>
                ${item.price.toFixed(2)}
              </span>
            </div>

            {/* Info */}
            <div className="px-6 pt-5 pb-8">
              <p className="text-cream/60 text-sm leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Flavor chips */}
              <p className="text-cream/30 text-[10px] uppercase tracking-[0.2em] mb-3">
                Profil de saveur
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {item.flavorProfile.map((f, i) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: `${item.color}${i === 0 ? "28" : "14"}`,
                      color: item.color,
                      border: `1px solid ${item.color}30`,
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
                  className="block w-full py-4 rounded-full text-center font-semibold text-sm uppercase tracking-[0.15em] text-blueboy-dark"
                  style={{ background: item.color }}
                >
                  Commander Maintenant
                </a>
                <button
                  onClick={handleClose}
                  className="block w-full py-3.5 rounded-full text-center text-sm uppercase tracking-[0.15em] text-cream/50 hover:text-cream transition-colors"
                  style={{ background: "rgba(255,248,240,0.05)", border: "1px solid rgba(255,248,240,0.08)" }}
                >
                  Retour au Menu
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ── Desktop layout: 3D canvas + info side-by-side ── */
          <div className="grid grid-cols-2 min-h-[500px]">
            {/* 3D Scene */}
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

            {/* Info panel */}
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
