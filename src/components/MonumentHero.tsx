"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Slot from "./Slot";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LETTERS = "MUREN".split("");
const CENTER = (LETTERS.length - 1) / 2;
// 1 at the middle letter, 0 at the outer letters — middle rises most, forming an arch
const CENTRALITY = LETTERS.map((_, i) => 1 - Math.abs(i - CENTER) / CENTER);

// how far each letter travels up, in vh, at full scroll progress.
// BASE is a gentle uniform lift; ARCH is the extra the middle letters get,
// so the wordmark bows into an arch that leads from the centre.
const BASE_LIFT = 6;
const ARCH_LIFT = 30;

export default function MonumentHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const monumentRef = useRef<HTMLDivElement | null>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const monument = monumentRef.current;
      const root = rootRef.current;
      if (!monument || !root) return;
      const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      /* ---- load sequence: the document prints ---- */
      const slotEl = root.querySelector<HTMLElement>(".herostrip .slot");
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      // letters rise from below, staggered from the centre out
      intro.from(letters, {
        yPercent: 118,
        opacity: 0,
        duration: 1.15,
        stagger: { each: 0.07, from: "center" },
      });
      // hero film wipes open top-to-bottom while the letters land
      if (slotEl) {
        intro.fromTo(
          slotEl,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power3.inOut",
            clearProps: "clipPath",
          },
          0.35
        );
      }
      intro.eventCallback("onComplete", () => ScrollTrigger.refresh());

      /* ---- arch scrub, migrated onto the shared Lenis/ScrollTrigger clock.
         GSAP composes `y` separately from the intro's yPercent, so the two
         never fight even if the user scrolls during the load sequence. ---- */
      const setters = letters.map((el) => gsap.quickSetter(el, "y", "vh"));
      let range = window.innerHeight;
      const measure = () => {
        const r = monument.getBoundingClientRect();
        range = Math.max(1, r.top + window.scrollY + r.height * 0.6);
      };
      measure();
      ScrollTrigger.create({
        start: 0,
        end: () => range,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate: (self) => {
          letters.forEach((_, i) => {
            setters[i](-self.progress * (BASE_LIFT + CENTRALITY[i] * ARCH_LIFT));
          });
        },
      });

      /* ---- hero film: gentle inner parallax through its window.
         Minimal scale headroom (1.06) keeps upscale-softening negligible;
         force3D:false avoids a permanent GPU layer so the frame stays crisp
         on HiDPI displays. ---- */
      const video = root.querySelector<HTMLVideoElement>(".herostrip .slot video");
      if (video && slotEl) {
        gsap.fromTo(
          video,
          { yPercent: -3, scale: 1.06 },
          {
            yPercent: 3,
            scale: 1.06,
            ease: "none",
            force3D: false,
            scrollTrigger: {
              trigger: slotEl,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    { scope: rootRef }
  );

  return (
    <header className="monument-top" ref={rootRef}>
      <div className="monument" aria-label="MUREN" ref={monumentRef}>
        {LETTERS.map((ch, i) => (
          <span
            className="monument-letter"
            key={i}
            ref={(el) => {
              lettersRef.current[i] = el;
            }}
            aria-hidden="true"
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="herostrip wrap">
        <Slot
          big="THE ARRAY — HERO FILM"
          sub="DROP IMAGE / VIDEO · 21:6"
          src="/assets/hero.mp4"
          locked
        />
      </div>
    </header>
  );
}
