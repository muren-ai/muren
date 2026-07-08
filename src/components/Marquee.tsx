"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { scrollBus } from "@/lib/scrollBus";

gsap.registerPlugin(useGSAP);

const ITEMS = [
  ["CAREER KONNECT", "SYS.01"],
  ["VR TRAINING", "SYS.02"],
  ["FACTORY COPILOT", "SYS.03"],
  ["ECO MUHAFIZ", "SYS.04"],
  ["WE BUILD OUR OWN SYSTEMS", "&", "DISRUPT THEM"],
] as const;

function Row() {
  return (
    <>
      {ITEMS.map((it, i) => (
        <span key={i}>
          {it.length === 3 ? (
            <>
              {it[0]} <em>{it[1]}</em> {it[2]}
            </>
          ) : (
            <>
              {it[0]} <em>{it[1]}</em>
            </>
          )}
        </span>
      ))}
    </>
  );
}

/**
 * Rail content is duplicated so xPercent can wrap at -50% seamlessly (v9).
 * The CSS `slide` keyframe stays as a no-JS fallback; when this mounts,
 * GSAP kills it and drives the rail itself so scroll velocity (sampled
 * from the Lenis scrollBus) can speed it up, reverse it, and shear it.
 */
export default function Marquee() {
  const railRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const rail = railRef.current;
    if (!rail) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(rail, { animation: "none" });
    const xSet = gsap.quickSetter(rail, "xPercent");
    const skewSet = gsap.quickSetter(rail, "skewX", "deg");
    const wrap = gsap.utils.wrap(-50, 0);

    const BASE = -3.6; // %/s — matches the old 26s CSS loop
    let x = 0;
    let smoothed = 0;

    const tick = (_t: number, dt: number) => {
      // signed velocity: scrolling down accelerates the rail forward,
      // a hard scroll up overpowers BASE and runs it backwards
      smoothed += (scrollBus.velocity - smoothed) * 0.1;
      const speed = BASE - gsap.utils.clamp(-42, 42, smoothed * 0.55);
      x = wrap(x + (speed * dt) / 1000);
      xSet(x);
      skewSet(gsap.utils.clamp(-5, 5, -smoothed * 0.09));
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  });

  return (
    <div className="marquee">
      <div className="rail" ref={railRef}>
        <Row />
        <Row />
      </div>
    </div>
  );
}
