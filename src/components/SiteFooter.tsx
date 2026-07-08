"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LETTERS = "MUREN".split("");
const CENTER = (LETTERS.length - 1) / 2;
const CENTRALITY = LETTERS.map((_, i) => 1 - Math.abs(i - CENTER) / CENTER);

/**
 * The bookend: the hero monument arched APART as you scrolled away — here
 * the letters settle back INTO a flat baseline as you approach the end.
 * The centre letter arrives first, the outer letters trail, so an arch
 * forms mid-travel and dissolves at rest: the opening gesture, reversed.
 */
export default function SiteFooter() {
  const rootRef = useRef<HTMLElement | null>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[];
      const monument = root.querySelector<HTMLElement>(".monument");

      if (monument && letters.length) {
        letters.forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: () => window.innerHeight * (0.06 + (1 - CENTRALITY[i]) * 0.16) },
            {
              y: 0,
              ease: "none",
              force3D: false,
              scrollTrigger: {
                trigger: monument,
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.3,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }

      /* CTA line rises through line masks */
      const cta = root.querySelector<HTMLElement>(".cta .t");
      if (cta) {
        const split = new SplitType(cta, { types: "lines,words" });
        if (split.words?.length) {
          gsap.from(split.words, {
            yPercent: 120,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.05,
            scrollTrigger: { trigger: cta, start: "top 85%", once: true },
            // release the line masks at rest so descenders aren't shaved
            onComplete: () => {
              if (split.lines) gsap.set(split.lines, { overflow: "visible" });
            },
          });
        }
      }

      /* magnetic pull on the contact link */
      const link = root.querySelector<HTMLElement>(".cta a");
      if (link && window.matchMedia("(pointer: fine)").matches) {
        const xTo = gsap.quickTo(link, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(link, "y", { duration: 0.4, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const r = link.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const dist = Math.hypot(dx, dy);
          const REACH = 130;
          if (dist < REACH) {
            const pull = 1 - dist / REACH;
            xTo(dx * pull * 0.35);
            yTo(dy * pull * 0.35);
          } else {
            xTo(0);
            yTo(0);
          }
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      }
    },
    { scope: rootRef }
  );

  return (
    <footer ref={rootRef}>
      <div className="cta">
        <div className="t">Let&apos;s build something that matters.</div>
        <a href="#" data-contact>TALK TO THE GROUP →</a>
      </div>
      <div className="monument display" aria-label="MUREN">
        {LETTERS.map((ch, i) => (
          <span
            className="f-letter"
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
      <div className="foot-meta">
        <span>© 2026 MUREN (PRIVATE) LIMITED · ISLAMABAD, PK</span>
        <span>RESEARCH FIRST · PRODUCT ALWAYS</span>
        <span>
          <a
            href="https://www.linkedin.com/company/muren/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LINKEDIN
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/muren-ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            GITHUB
          </a>{" "}
          · <a href="/terms">TERMS &amp; SERVICES</a>
        </span>
      </div>
    </footer>
  );
}
