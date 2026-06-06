"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useStore } from "@/store/useStore";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const { sceneAccentColor } = useStore();

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0 });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.18, ease: "power2.out" });
    };

    const onEnter = () => {
      gsap.to(ring, { scale: 2.8, opacity: 0.5, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 0.4, duration: 0.2 });
    };

    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMove);

    // Re-attach hover listeners when DOM changes
    const attachHover = () => {
      document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    attachHover();
    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, []);

  // Animate cursor color when scene changes
  useEffect(() => {
    if (!dotRef.current || !ringRef.current) return;
    gsap.to([dotRef.current, ringRef.current], {
      borderColor: sceneAccentColor,
      backgroundColor: sceneAccentColor,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [sceneAccentColor]);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-colors"
        style={{ backgroundColor: sceneAccentColor || "#FF6B9D" }}
      />
      <div
        ref={ringRef}
        className="fixed w-9 h-9 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 border"
        style={{ borderColor: sceneAccentColor || "#FF6B9D", opacity: 0.7 }}
      />
    </>
  );
}
