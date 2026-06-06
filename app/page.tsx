"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Navbar } from "@/components/ui/Navbar";
import { JourneyScroller } from "@/components/journey/JourneyScroller";
import { Marquee } from "@/components/sections/Marquee";
import { StorySection } from "@/components/sections/StorySection";
import { MenuSection } from "@/components/sections/MenuSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  const { isLoading } = useStore();

  useEffect(() => {
    document.body.style.overflow = isLoading ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isLoading]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.6s ease" }}>
        <Navbar />
        <main>
          {/* Phase 3: Immersive scene journey — replaces Hero + FeaturedSection */}
          <JourneyScroller />
          <Marquee />
          <StorySection />
          <MenuSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
