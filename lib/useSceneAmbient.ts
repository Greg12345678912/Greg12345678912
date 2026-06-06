"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { SCENES } from "@/lib/scenes";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try { audioCtx = new AudioContext(); } catch { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

interface AmbientNodes {
  osc: OscillatorNode;
  gain: GainNode;
  lfo?: OscillatorNode;
  filter?: BiquadFilterNode;
}

export function useSceneAmbient(sceneIndex: number) {
  const { audioEnabled } = useStore();
  const nodesRef = useRef<AmbientNodes | null>(null);

  useEffect(() => {
    const scene = SCENES[sceneIndex];
    if (!scene) return;

    function stop() {
      const nodes = nodesRef.current;
      if (!nodes) return;
      const ctx = getCtx();
      const now = ctx?.currentTime ?? 0;
      try {
        nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
        nodes.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        setTimeout(() => {
          try { nodes.osc.stop(); nodes.lfo?.stop(); } catch {}
        }, 650);
      } catch {}
      nodesRef.current = null;
    }

    if (!audioEnabled) {
      stop();
      return;
    }

    const ctx = getCtx();
    if (!ctx) return;

    // Fade out previous
    stop();

    const now = ctx.currentTime;

    // Main oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = scene.droneType;
    osc.frequency.setValueAtTime(scene.droneHz, now);

    // LFO for gentle vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, now);
    lfoGain.gain.setValueAtTime(scene.droneHz * 0.004, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Low-pass filter to make it warm/subliminal
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);
    filter.Q.setValueAtTime(0.8, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Fade in
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(scene.droneGain, now + 1.2);

    osc.start(now);
    lfo.start(now);

    nodesRef.current = { osc, gain, lfo, filter };

    return () => stop();
  }, [sceneIndex, audioEnabled]);
}
