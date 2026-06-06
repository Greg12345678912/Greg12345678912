"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
    };

    const onEnterHover = () => {
      gsap.to(follower, { scale: 2.5, opacity: 0.6, duration: 0.3, ease: "power2.out" });
    };

    const onLeaveHover = () => {
      gsap.to(follower, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMove);

    const hoverEls = document.querySelectorAll("a, button, [data-hover]");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnterHover);
      el.addEventListener("mouseleave", onLeaveHover);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor fixed w-2 h-2 rounded-full bg-white pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ mixBlendMode: "difference" }}
      />
      <div
        ref={followerRef}
        className="cursor fixed w-8 h-8 rounded-full border border-white pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ mixBlendMode: "difference" }}
      />
    </>
  );
}
