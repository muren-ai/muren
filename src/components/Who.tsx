"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The traveling sentence: split-type breaks the paragraph into words, all
 * sitting at ~12% ink; a scrubbed stagger develops them to full ink one by
 * one as you scroll — the sentence "develops" like a photograph. The word
 * "build" stamps when the scrub reaches it, and the underline under
 * "people decide" draws itself.
 */
export default function Who() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const txt = root?.querySelector<HTMLElement>(".txt");
      if (!root || !txt) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const split = new SplitType(txt, { types: "words" });
      const words = split.words ?? [];
      if (!words.length) return;

      gsap.set(words, { opacity: 0.12 });
      gsap.to(words, {
        opacity: 1,
        ease: "none",
        stagger: 0.06,
        scrollTrigger: {
          trigger: txt,
          start: "top 80%",
          end: "bottom 45%",
          scrub: 0.4,
        },
      });

      // "build" stamps in — a quick press as its word develops
      const buildEl = txt.querySelector<HTMLElement>("b");
      if (buildEl) {
        gsap.set(buildEl, { display: "inline-block", transformOrigin: "50% 80%" });
        gsap.fromTo(
          buildEl,
          { scale: 1.35, rotate: -2.5 },
          {
            scale: 1,
            rotate: 0,
            duration: 0.45,
            ease: "back.out(2.5)",
            immediateRender: false,
            scrollTrigger: {
              trigger: txt,
              start: "top 62%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // underline draw on "people decide" as the sentence resolves
      const u = txt.querySelector<HTMLElement>(".u");
      if (u) {
        ScrollTrigger.create({
          trigger: txt,
          start: "bottom 55%",
          onEnter: () => u.classList.add("drawn"),
          onLeaveBack: () => u.classList.remove("drawn"),
        });
      }

      // top rule draws itself as the section arrives (::before reads --rule-p)
      gsap.fromTo(
        root,
        { "--rule-p": 0 },
        {
          "--rule-p": 1,
          duration: 1.1,
          ease: "power3.inOut",
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        }
      );

      ScrollTrigger.refresh();
    },
    { scope: rootRef }
  );

  return (
    <section className="who wrap" ref={rootRef}>
      <div className="lab">WHO WE ARE</div>
      <div>
        <p className="txt">
          We&apos;re a deep-tech research group in Islamabad — and we don&apos;t
          advise, we <b>build</b>. Four systems, shipped and running, that let
          people see what they couldn&apos;t before. Our AI recommends;{" "}
          <span className="u">people decide</span>.
        </p>
        <a className="pill" href="#work">
          SEE THE WORK →
        </a>
      </div>
    </section>
  );
}
