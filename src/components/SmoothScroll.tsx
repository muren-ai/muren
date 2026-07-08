"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollBus } from "@/lib/scrollBus";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll + GSAP ScrollTrigger, sharing ONE ticker. This is what
 * makes the pinned scroll-scrubbed sections (e.g. the CS.01 Career Coach panel)
 * scrub correctly: ScrollTrigger pins via position:fixed (not CSS sticky, which
 * v9's overflow-x:hidden broke), and Lenis feeds it a smoothed scroll position.
 * Disabled under reduced-motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    // one loop: GSAP ticker drives Lenis; Lenis scroll drives ScrollTrigger
    lenis.on("scroll", (e: Lenis) => {
      scrollBus.velocity = e.velocity;
      ScrollTrigger.update();
    });
    const add = (time: number) => {
      lenis.raf(time * 1000);
      // decay so consumers (marquee, stamp) settle when scrolling stops
      // abruptly and Lenis stops emitting scroll events
      scrollBus.velocity *= 0.9;
      if (Math.abs(scrollBus.velocity) < 0.01) scrollBus.velocity = 0;
    };
    gsap.ticker.add(add);
    gsap.ticker.lagSmoothing(0);

    // route in-page anchors through Lenis (only when they resolve to a target)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      const href = a?.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -60 });
    };
    document.addEventListener("click", onClick);

    // recompute pin/trigger positions after fonts + layout settle
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 350);
    window.addEventListener("load", refresh);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(add);
      lenis.destroy();
    };
  }, []);

  return null;
}
